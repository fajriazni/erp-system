<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JournalTemplateLine extends Model
{
    use HasFactory;

    protected $fillable = [
        'journal_template_id',
        'chart_of_account_id',
        'debit_credit',
        'amount_formula',
        'description',
        'sequence',
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(JournalTemplate::class, 'journal_template_id');
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(ChartOfAccount::class, 'chart_of_account_id');
    }
}
