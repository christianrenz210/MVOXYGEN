<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $primaryKey = 'id';
    
    protected $fillable = [
        'name',
        'contact_number',
        'address',
        'status',
        'total_rentals',
        'join_date',
        'profile_image',
    ];

    protected $casts = [
        'total_rentals' => 'integer',
        'id' => 'integer',
    ];

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'customer_id', 'id');
    }

    public function rentalRequests()
    {
        return $this->hasMany(RentalRequest::class, 'customer_id', 'id');
    }

    public function user()
    {
        return $this->hasOne(User::class, 'name', 'name');
    }
}
