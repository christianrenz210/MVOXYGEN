<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActivityController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 50); // Default 50 per page
        $filter = $request->get('filter', 'all');
        
        $query = Activity::with(['user', 'customer', 'rentalRequest']);
        
        // Filter by action type if specified
        if ($filter !== 'all' && $filter) {
            $query->where('action', $filter);
        }
        
        // Get ALL activities with pagination
        $activities = $query->latest()->paginate($perPage);
        
        return Inertia::render('admin/activity-logs', [
            'logs' => $activities->items(),
            'pagination' => [
                'current_page' => $activities->currentPage(),
                'last_page' => $activities->lastPage(),
                'per_page' => $activities->perPage(),
                'total' => $activities->total(),
            ]
        ]);
    }
}
