<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'category_id',
        'sku',
        'name',
        'slug',
        'short_description',
        'description',
        'price',
        'compare_price',
        'cost',
        'stock_quantity',
        'low_stock_threshold',
        'weight',
        'dimensions',
        'image_url',
        'gallery',
        'is_active',
        'is_featured',
        'is_taxable',
        'views_count',
    ];
}
