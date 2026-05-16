<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Deposit extends Model
{
    use HasFactory;

    protected $fillable = [
        'rental_id',
        'customer_id',
        'amount',
        'payment_method',
        'reference_number',
        'status',
        'payment_date',
        'notes',
        'transaction_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'date',
    ];

    public function rental()
    {
        return $this->belongsTo(Rental::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeRefunded($query)
    {
        return $query->where('status', 'refunded');
    }
}
