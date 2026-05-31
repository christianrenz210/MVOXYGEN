<?php

namespace App\Http\Controllers;

use App\Models\Tank;
use App\Models\Rental;
use App\Models\Maintenance;
use App\Models\Supplier;
use App\Models\PurchaseOrderItem;
use Illuminate\Support\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    /**
     * Display a listing of the inventory.
     */
    public function index(): Response
    {
        $activeRentalsByTankType = Rental::whereIn('rentals.status', ['active', 'pending_return'])
            ->leftJoin('tanks as rental_tanks', 'rentals.tank_id', '=', 'rental_tanks.tank_id')
            ->selectRaw('rental_tanks.tank_type as tank_type, COUNT(*) as active_count')
            ->groupBy('rental_tanks.tank_type')
            ->pluck('active_count', 'tank_type')
            ->filter(function ($count, $tankType) {
                return !is_null($tankType);
            });

        $tanks = Tank::whereNotIn('tank_type', ['Flask Type Small', 'Flask Type Standard'])
            ->orderBy('tank_type')
            ->get()
            ->map(function ($tank) use ($activeRentalsByTankType) {
                $tank->active_rental_count = (int) ($activeRentalsByTankType[$tank->tank_type] ?? 0);
                return $tank;
            });

        // Convert image paths to full URLs
        $tanks->transform(function ($tank) {
            if ($tank->image) {
                // If image already has /storage/ prefix, use it as-is
                if (str_starts_with($tank->image, '/storage/')) {
                    $tank->image = asset($tank->image);
                }
                // If image is a relative path without /storage/, convert it
                elseif (!str_starts_with($tank->image, 'http')) {
                    $tank->image = asset(Storage::url($tank->image));
                }
            }
            return $tank;
        });

        $maintenances = Maintenance::orderBy('created_at', 'desc')->get();
        $suppliers = Supplier::get();

        // Get available tank options from purchase orders (only products that have been purchased and received)
        $purchaseOrderItems = PurchaseOrderItem::select(
                'purchase_order_items.product_name',
                'purchase_order_items.price',
                'purchase_order_items.quantity',
                'purchase_order_items.received_quantity',
                'purchase_order_items.created_at',
                'purchase_orders.order_date as order_date'
            )
            ->join('purchase_orders', 'purchase_order_items.purchase_order_id', '=', 'purchase_orders.id')
            ->whereIn('purchase_orders.status', ['received', 'partial_received', 'shipped'])
            ->orderBy('purchase_order_items.created_at', 'desc')
            ->get();

        $availableTankOptions = $purchaseOrderItems
            ->groupBy('product_name')
            ->map(function ($items, $productName) {
                $latestItem = $items->sortByDesc('created_at')->first();

                $totalOrdered = $items->sum(function ($item) {
                    return $item->received_quantity > 0 ? $item->received_quantity : $item->quantity;
                });

                $orderDate = null;
                if ($latestItem) {
                    $orderDateSource = $latestItem->order_date ?? $latestItem->created_at;
                    if ($orderDateSource) {
                        $orderDate = Carbon::parse($orderDateSource)->toDateString();
                    }
                }

                return [
                    'name' => $productName,
                    'price' => (float) $latestItem->price,
                    'quantity' => (int) $totalOrdered,
                    'orderDate' => $orderDate,
                ];
            })
            ->values()
            ->sortBy('name', SORT_REGULAR, false)
            ->values()
            ->all();

        return Inertia::render('inventory/index', [
            'products' => $tanks,
            'maintenances' => $maintenances,
            'suppliers' => $suppliers,
            'availableTankOptions' => $availableTankOptions,
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }

    /**
     * Store a newly created tank in inventory.
     */
    public function store(Request $request)
    {
        $request->validate([
            'tank_type' => 'required|string|max:255',
            'quantity' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'last_refilled' => 'nullable|date',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10240',
        ]);

        $tankData = [
            'tank_type' => $request->tank_type,
            'quantity' => $request->quantity,
            'price' => $request->price,
            'last_refilled' => $request->last_refilled,
            'status' => 'available',
        ];

        // Handle image upload
        if ($request->hasFile('image')) {
            // Ensure storage directory exists
            if (!Storage::disk('public')->exists('tank-images')) {
                Storage::disk('public')->makeDirectory('tank-images');
            }

            $file = $request->file('image');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('tank-images', $filename, 'public');
            $tankData['image'] = '/storage/' . $path;
        }

        Tank::create($tankData);

        return redirect()->back()->with('success', 'Tank added successfully!');
    }

    /**
     * Update an existing tank in inventory.
     */
    public function update(Request $request, Tank $tank)
    {
        $validator = Validator::make($request->all(), [
            'tank_type' => 'required|string|max:255',
            'quantity' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0',
            'last_refilled' => 'nullable|date',
            'status' => 'required|string|in:available,rented_out,maintenance',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10240',
            'quantity_change_reason' => 'nullable|string|max:1000'
        ]);

        $validator->after(function ($validator) use ($request, $tank) {
            $currentQuantity = (int) $tank->quantity;
            $newQuantity = (int) $request->quantity;

            if ($newQuantity !== $currentQuantity) {
                $reason = trim((string) $request->quantity_change_reason);
                if ($reason === '') {
                    $validator->errors()->add('quantity_change_reason', 'Reason for quantity change is required when quantity is modified.');
                }
            }
        });

        $validator->validate();

        $tankData = [
            'tank_type' => $request->tank_type,
            'quantity' => $request->quantity,
            'price' => $request->price,
            'last_refilled' => $request->last_refilled,
            'status' => $request->status,
        ];

        // Log quantity change if quantity has changed
        if ($tank->quantity != $request->quantity) {
            \App\Models\InventoryQuantityLog::create([
                'tank_id' => $tank->id,
                'user_id' => auth()->id(),
                'old_quantity' => $tank->quantity,
                'new_quantity' => $request->quantity,
                'quantity_change' => $request->quantity - $tank->quantity,
                'reason' => $request->quantity_change_reason,
            ]);
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            // Ensure storage directory exists
            if (!Storage::disk('public')->exists('tank-images')) {
                Storage::disk('public')->makeDirectory('tank-images');
            }

            // Delete old image if exists
            if ($tank->image) {
                $oldPath = str_replace('/storage/', '', $tank->image);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            $file = $request->file('image');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('tank-images', $filename, 'public');
            $tankData['image'] = '/storage/' . $path;
        }

        $tank->update($tankData);

        return redirect()->back()->with('success', 'Tank updated successfully!');
    }

    /**
     * Store a new maintenance record.
     */
    public function storeMaintenance(Request $request)
    {
        $request->validate([
            'tank_type' => 'required|string|max:255',
            'quantity' => 'required|integer|min:1',
            'condition' => 'required|string',
        ]);

        // Check if tank exists in inventory
        $tank = Tank::where('tank_type', $request->tank_type)->first();

        if (!$tank) {
            return redirect()->back()->withErrors(['tank_type' => 'Tank must be added to inventory first before adding to maintenance.']);
        }

        // Check if tank has sufficient quantity
        if ($tank->quantity < $request->quantity) {
            return redirect()->back()->withErrors(['quantity' => 'Insufficient quantity in inventory. Available: ' . $tank->quantity]);
        }

        // Create maintenance record
        Maintenance::create([
            'tank_type' => $request->tank_type,
            'quantity' => $request->quantity,
            'condition' => $request->condition,
            'status' => 'pending',
            'valve' => $request->valve,
        ]);

        // Reduce tank quantity
        $tank->quantity -= $request->quantity;
        $tank->save();

        return redirect()->back()->with('success', 'Maintenance record added successfully and tank quantity reduced.');
    }

    /**
     * Mark a maintenance record as in progress and set tank status to maintenance.
     */
    public function startMaintenance(Maintenance $maintenance)
    {
        if ($maintenance->status === 'done') {
            return redirect()->back()->with('error', 'Completed maintenance records cannot be reopened.');
        }

        $tank = Tank::where('tank_type', $maintenance->tank_type)->first();
        if ($tank) {
            $tank->status = 'maintenance';
            $tank->save();
        }

        $maintenance->update(['status' => 'in_maintenance']);

        return redirect()->back()->with('success', 'Maintenance marked as in progress and tank status updated.');
    }

    /**
     * Complete a maintenance record and restore tank quantity.
     */
    public function completeMaintenance(Maintenance $maintenance)
    {
        // Update maintenance status to done
        $maintenance->update(['status' => 'done']);

        // Find the tank and restore quantity
        $tank = Tank::where('tank_type', $maintenance->tank_type)->first();
        if ($tank) {
            $tank->quantity += $maintenance->quantity;
            $tank->status = 'available';
            $tank->save();
        }

        return redirect()->back()->with('success', 'Maintenance completed and tank quantity restored.');
    }
}
