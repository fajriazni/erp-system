<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentTerm extends Model
{
    use \Illuminate\Database\Eloquent\Factories\HasFactory;

    protected $fillable = [
        'name',
        'description',
        'type', // standard, schedule
        'days_due',
        'schedule_definition',
        'is_active',
    ];

    protected $casts = [
        'schedule_definition' => 'array',
        'days_due' => 'integer',
        'is_active' => 'boolean',
    ];
}
