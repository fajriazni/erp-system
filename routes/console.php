<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
Schedule::command('purchasing:check-renewals')->daily();
Schedule::job(new \App\Jobs\CheckAgreementExpiryJob)->daily();
Schedule::job(new \App\Jobs\CheckBlanketOrderExpiryJob)->daily();
