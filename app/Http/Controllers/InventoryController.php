<?php

namespace App\Http\Controllers;

use App\Models\Tank;
use App\Models\Maintenance;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    /**
     * Display a listing of the inventory.
     */
    public function index(): Response
    {
        $tanks = Tank::orderBy('tank_type')->get();

        // Convert image paths to full URLs
        $tanks->transform(function ($tank) {
            if ($tank->image) {
                // If image already has /storage/ prefix, use it as-is
                if (str_starts_with($tank->image, '/storage/')) {
                    $tank->image = asset($tank->image);
                }
                // If image is a relative path without /storage/, convert it
                elseif (!str_starts_with($tank->image, 'http')) {
                    $tank->image = Storage::url($tank->image);
                }
            }
            return $tank;
        });

        $maintenances = Maintenance::orderBy('created_at', 'desc')->get();
        $suppliers = Supplier::get();

        return Inertia::render('inventory/index', [
            'products' => $tanks,
            'maintenances' => $maintenances,
            'suppliers' => $suppliers,
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
        $request->validate([
            'tank_type' => 'required|string|max:255',
            'quantity' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'last_refilled' => 'nullable|date',
            'status' => 'required|string|in:available,rented_out,maintenance',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10240',
        ]);

        $tankData = [
            'tank_type' => $request->tank_type,
            'quantity' => $request->quantity,
            'price' => $request->price,
            'last_refilled' => $request->last_refilled,
            'status' => $request->status,
        ];

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
            'valve' => 'required|string',
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
            'valve' => $request->valve,
        ]);

        // Reduce tank quantity
        $tank->quantity -= $request->quantity;
        $tank->save();

        return redirect()->back()->with('success', 'Maintenance record added successfully and tank quantity reduced.');
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
            $tank->save();
        }

        return redirect()->back()->with('success', 'Maintenance completed and tank quantity restored.');
    }
}
