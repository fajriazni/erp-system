<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QcDefectCode extends Model
{
    protected $fillable = [
        'code',
        'name',
        'description',
        'category',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
    //
}
