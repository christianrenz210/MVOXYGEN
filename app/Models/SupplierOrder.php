<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupplierOrder extends Model
{
    protected $fillable = [
        'supplier_id',
        'tank_type',
        'quantity',
        'price',
        'total_amount',
        'status',
        'payment_status',
        'notes',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }
}
