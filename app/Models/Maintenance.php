<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Maintenance extends Model
{
    protected $fillable = [
        'tank_type',
        'quantity',
        'condition',
        'valve',
        'status',
    ];
}
