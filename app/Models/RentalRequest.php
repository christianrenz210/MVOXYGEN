<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class RentalRequest extends Model
{
    protected $fillable = [
        'customer_id',
        'request_type',
        'product_id',
        'tank_type',
        'assigned_tank_id',
        'quantity',
        'start_date',
        'end_date',
        'purpose',
        'contact_number',
        'address',
        'status',
        'priority',
        'admin_notes',
        'rejected_reason',
        'tracking_number'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date'
    ];

    protected $appends = [
        'days_until_return'
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function rental(): HasOne
    {
        return $this->hasOne(Rental::class);
    }

    public function assignedTank(): BelongsTo
    {
        return $this->belongsTo(Tank::class, 'assigned_tank_id', 'tank_id');
    }

    public function maintenance()
    {
        return $this->hasOne(Maintenance::class, 'tank_type', 'tank_type');
    }

    public function getStatusBadgeAttribute(): string
    {
        return match($this->status) {
            'pending' => '<span class="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>',
            'approved' => '<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Approved</span>',
            'rejected' => '<span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Rejected</span>',
            'canceled' => '<span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Cancelled</span>',
            'completed' => '<span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Completed</span>',
            default => '<span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">' . $this->status . '</span>'
        };
    }

    public function getDaysUntilReturnAttribute(): int
    {
        $today = now()->startOfDay();
        $endDate = $this->end_date ? \Carbon\Carbon::parse($this->end_date) : null;
        
        if (!$endDate) {
            return 0;
        }
        
        return $today->diffInDays($endDate, false);
    }

    public function isOverdue(): bool
    {
        return $this->getDaysUntilReturnAttribute() < 0 && $this->status === 'approved';
    }

    public function isDueSoon(): bool
    {
        $daysUntil = $this->getDaysUntilReturnAttribute();
        return $daysUntil >= 0 && $daysUntil <= 3 && $this->status === 'approved';
    }

    public static function getTanksDueForReturn(int $days = 365)
    {
        $query = self::with(['customer', 'rental'])
            ->where(function($query) {
                $query->where('status', 'approved')
                      ->orWhereHas('rental', function($q) {
                          $q->where('status', 'active');
                      });
            })
            ->where('end_date', '<=', now()->addDays($days))
            ->orderBy('end_date', 'asc');
            
        \Log::info('getTanksDueForReturn SQL: ' . $query->toSql());
        \Log::info('getTanksDueForReturn bindings: ', $query->getBindings());
        
        $results = $query->get();
        \Log::info('getTanksDueForReturn results count: ' . $results->count());
        
        // Log each result with status
        foreach ($results as $result) {
            \Log::info('Tank result - ID: ' . $result->id . ', Status: ' . $result->status . ', Customer: ' . ($result->customer ? $result->customer->name : 'No customer') . ', End Date: ' . $result->end_date);
        }
        
        return $results;
    }

    public static function getOverdueTanks()
    {
        return self::with(['customer', 'rental'])
            ->where(function($query) {
                $query->where('status', 'approved')
                      ->orWhereHas('rental', function($q) {
                          $q->where('status', 'active');
                      });
            })
            ->where('end_date', '<', now())
            ->orderBy('end_date', 'desc')
            ->get();
    }
}
