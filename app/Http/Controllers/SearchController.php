<?php

namespace App\Http\Controllers;

use App\Models\RentalRequest;
use App\Models\Tank;
use App\Models\Customer;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->get('q', '');
        $results = [];

        if (strlen($query) >= 2) {
            // Search rentals
            $rentals = RentalRequest::where('id', 'LIKE', "%{$query}%")
                ->orWhere('tank_type', 'LIKE', "%{$query}%")
                ->orWhere('purpose', 'LIKE', "%{$query}%")
                ->orWhere('contact_number', 'LIKE', "%{$query}%")
                ->orWhere('tracking_number', 'LIKE', "%{$query}%")
                ->limit(5)
                ->get(['id', 'tank_type', 'purpose', 'tracking_number']);

            foreach ($rentals as $rental) {
                $results[] = [
                    'id' => $rental->id,
                    'type' => 'rental',
                    'title' => "Rental #{$rental->id} - {$rental->tank_type}",
                    'subtitle' => $rental->purpose ?? 'No purpose specified',
                    'url' => "/rentals/{$rental->id}"
                ];
            }

            // Search tanks
            $tanks = Tank::where('tank_type', 'LIKE', "%{$query}%")
                ->orWhere('status', 'LIKE', "%{$query}%")
                ->limit(5)
                ->get(['id', 'tank_type', 'quantity', 'status']);

            foreach ($tanks as $tank) {
                $results[] = [
                    'id' => $tank->id,
                    'type' => 'tank',
                    'title' => $tank->tank_type,
                    'subtitle' => "Quantity: {$tank->quantity} - Status: {$tank->status}",
                    'url' => '/inventory'
                ];
            }

            // Search customers
            $customers = Customer::where('name', 'LIKE', "%{$query}%")
                ->orWhere('contact_number', 'LIKE', "%{$query}%")
                ->orWhere('address', 'LIKE', "%{$query}%")
                ->limit(5)
                ->get(['id', 'name', 'contact_number', 'address']);

            foreach ($customers as $customer) {
                $results[] = [
                    'id' => $customer->id,
                    'type' => 'customer',
                    'title' => $customer->name,
                    'subtitle' => $customer->contact_number ?? 'No contact number',
                    'url' => "/customers"
                ];
            }
        }

        return response()->json([
            'results' => $results,
            'query' => $query
        ]);
    }
}
