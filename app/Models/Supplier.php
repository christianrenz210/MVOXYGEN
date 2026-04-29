<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'plant_name',
        'address',
        'contact_person',
        'contact_number',
        'email',
        'notes',
        'is_active',
        'oxygen_tank_price',
        'argon_small_price',
        'argon_big_price',
        'nitro_price',
        'medical_oxygen_big_price',
        'medical_oxygen_medium_price',
        'flask_type_standard_price',
        'flask_type_small_price',
        'industrial_oxygen_price',
        'acetylene_price',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'oxygen_tank_price' => 'decimal:2',
        'argon_small_price' => 'decimal:2',
        'argon_big_price' => 'decimal:2',
        'nitro_price' => 'decimal:2',
        'medical_oxygen_big_price' => 'decimal:2',
        'medical_oxygen_medium_price' => 'decimal:2',
        'flask_type_standard_price' => 'decimal:2',
        'flask_type_small_price' => 'decimal:2',
        'industrial_oxygen_price' => 'decimal:2',
        'acetylene_price' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function rentals(): HasMany
    {
        return $this->hasMany(Rental::class);
    }

    public function supplierOrders(): HasMany
    {
        return $this->hasMany(SupplierOrder::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get the fixed price for a specific tank type
     */
    public function getFixedPrice(string $tankType): ?float
    {
        $priceField = match($tankType) {
            'Oxygen Tank' => 'oxygen_tank_price',
            'Argon Small' => 'argon_small_price',
            'Argon Big' => 'argon_big_price',
            'Nitro' => 'nitro_price',
            'Medical Oxygen Big' => 'medical_oxygen_big_price',
            'Medical Oxygen Medium' => 'medical_oxygen_medium_price',
            'Flask Type Standard' => 'flask_type_standard_price',
            'Flask Type Small' => 'flask_type_small_price',
            'Industrial Oxygen' => 'industrial_oxygen_price',
            'Acetylene' => 'acetylene_price',
            default => null
        };

        return $priceField ? $this->$priceField : null;
    }
}
