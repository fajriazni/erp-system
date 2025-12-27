<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Bind Domain Repository Interfaces to Infrastructure Implementations
        $this->app->bind(
            \App\Domain\Accounting\Repositories\JournalEntryRepositoryInterface::class,
            \App\Infrastructure\Persistence\Eloquent\Accounting\EloquentJournalEntryRepository::class
        );

        $this->app->bind(
            \App\Domain\Accounting\Repositories\AccountingPeriodRepositoryInterface::class,
            \App\Infrastructure\Persistence\Eloquent\Accounting\EloquentAccountingPeriodRepository::class
        );

        $this->app->bind(
            \App\Domain\Accounting\Repositories\ChartOfAccountsRepositoryInterface::class,
            \App\Infrastructure\Persistence\Eloquent\Accounting\EloquentChartOfAccountsRepository::class
        );

        $this->app->bind(
            \App\Domain\Accounting\ACL\SalesAdapterInterface::class,
            \App\Domain\Accounting\ACL\SalesAdapter::class
        );

        $this->app->bind(
            \App\Domain\Accounting\ACL\PurchasingAdapterInterface::class,
            \App\Domain\Accounting\ACL\PurchasingAdapter::class
        );

        $this->app->bind(
            \App\Domain\Accounting\ACL\InventoryAdapterInterface::class,
            \App\Domain\Accounting\ACL\InventoryAdapter::class
        );

        $this->app->bind(
            \App\Domain\Accounting\Repositories\PostingRuleRepositoryInterface::class,
            \App\Infrastructure\Persistence\Eloquent\Accounting\EloquentPostingRuleRepository::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register Event Listeners
        \Illuminate\Support\Facades\Event::listen(
            \App\Domain\Sales\Events\CustomerInvoicePosted::class,
            [\App\Domain\Accounting\Listeners\SalesEventListener::class, 'handleCustomerInvoicePosted']
        );

        \Illuminate\Support\Facades\Event::listen(
            \App\Domain\Purchasing\Events\GoodsReceiptPosted::class,
            [\App\Domain\Accounting\Listeners\PurchasingEventListener::class, 'handleGoodsReceiptPosted']
        );

        \Illuminate\Support\Facades\Event::listen(
            \App\Domain\Inventory\Events\StockMoveRecorded::class,
            [\App\Domain\Accounting\Listeners\InventoryEventListener::class, 'handleStockMoveRecorded']
        );

        // Register observers
        \App\Models\PurchaseOrder::observe(\App\Observers\PurchaseOrderObserver::class);
    }
}
