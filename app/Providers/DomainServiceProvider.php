<?php

namespace App\Providers;

use App\Domain\Finance\Contracts\ChartOfAccountRepositoryInterface;
use App\Domain\Finance\Contracts\JournalEntryRepositoryInterface;
use App\Domain\Finance\Repositories\ChartOfAccountRepository;
use App\Domain\Finance\Repositories\JournalEntryRepository;
use Illuminate\Support\ServiceProvider;

/**
 * Domain Service Provider
 *
 * Binds domain contracts to implementations.
 */
class DomainServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Finance Repositories
        $this->app->bind(
            JournalEntryRepositoryInterface::class,
            JournalEntryRepository::class
        );

        $this->app->bind(
            ChartOfAccountRepositoryInterface::class,
            ChartOfAccountRepository::class
        );
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
