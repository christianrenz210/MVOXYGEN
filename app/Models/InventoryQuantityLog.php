<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryQuantityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'tank_id',
        'user_id',
        'old_quantity',
        'new_quantity',
        'quantity_change',
        'reason',
    ];

    protected $casts = [
        'old_quantity' => 'integer',
        'new_quantity' => 'integer',
        'quantity_change' => 'integer',
    ];

    public function tank()
    {
        return $this->belongsTo(Tank::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
