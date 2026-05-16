<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Sale extends Model
{
    protected $fillable = [
        'customer_name',
        'payment_method',
        'total_amount',
        'items',
        'status',
        'user_id',
        'gcash_reference',
        'customer_phone',
        'payment_time',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'items' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
