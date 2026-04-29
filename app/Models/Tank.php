<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Tank extends Model
{
    protected $fillable = [
        'tank_type',
        'quantity',
        'price',
        'last_refilled',
        'status',
        'tank_id',
        'image',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($tank) {
            if (empty($tank->tank_id)) {
                // Generate prefix based on tank type
                $prefix = 'TANK';
                if (stripos($tank->tank_type, 'oxygen') !== false) {
                    $prefix = 'OXY';
                } elseif (stripos($tank->tank_type, 'argon') !== false) {
                    $prefix = 'ARG';
                } elseif (stripos($tank->tank_type, 'nitro') !== false) {
                    $prefix = 'NIT';
                } elseif (stripos($tank->tank_type, 'acetylene') !== false) {
                    $prefix = 'ACE';
                } elseif (stripos($tank->tank_type, 'flask') !== false) {
                    $prefix = 'FLS';
                }

                // Generate unique ID
                $tank->tank_id = $prefix . '-' . str_pad(Tank::count() + 1, 4, '0', STR_PAD_LEFT);
            }
        });
    }
}
