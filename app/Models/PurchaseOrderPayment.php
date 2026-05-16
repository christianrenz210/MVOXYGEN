<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseOrderPayment extends Model
{
    protected $fillable = [
        'purchase_order_id',
        'amount',
        'payment_method',
        'gcash_reference',
        'gcash_phone',
        'gcash_time',
    ];

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }
}
