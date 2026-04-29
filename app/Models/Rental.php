<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Rental extends Model
{
    protected $fillable = [
        'rental_request_id',
        'customer_id',
        'product_id',
        'tank_id',
        'start_date',
        'end_date',
        'status',
        'total_amount',
        'pickup_date',
        'return_date',
        'notes',
        'deposit_type',
        'deposit_amount',
        'deposit_payment_method',
        'deposit_payment_date',
        'deposit_status',
        'deposit_reference_number'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'pickup_date' => 'datetime',
        'return_date' => 'datetime',
        'total_amount' => 'decimal:2'
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function rentalRequest(): BelongsTo
    {
        return $this->belongsTo(RentalRequest::class);
    }

    public function tank(): BelongsTo
    {
        return $this->belongsTo(Tank::class, 'tank_id', 'tank_id');
    }
}
