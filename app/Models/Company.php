<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'logo_path',
        'currency',
        'tax_id',
    ];

    /**
     * Get the default company instance.
     */
    public static function default(): self
    {
        return static::firstOr(function () {
            return static::create([
                'name' => 'My Company',
                'currency' => 'IDR',
            ]);
        });
    }
}
