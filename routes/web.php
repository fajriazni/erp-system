<?php

use App\Http\Controllers\Accounting\PeriodController;
use App\Http\Controllers\Purchasing\BlanketOrderController;
use App\Http\Controllers\Purchasing\GoodsReceiptController;
use App\Http\Controllers\Purchasing\PurchaseAgreementController;
use App\Http\Controllers\Purchasing\PurchaseOrderController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    Route::prefix('dashboard')->name('dashboard.')->group(function () {
        // KPIs
        Route::get('/kpi/financial', function () {
            return Inertia::render('Dashboard/Kpi/Financial');
        })->name('kpi.financial');
        Route::get('/kpi/sales', function () {
            return Inertia::render('Dashboard/Kpi/Sales');
        })->name('kpi.sales');
        Route::get('/kpi/ops', function () {
            return Inertia::render('Dashboard/Kpi/Ops');
        })->name('kpi.ops');

        // Analytics
        Route::get('/analytics/sales', function () {
            return Inertia::render('Dashboard/Analytics/Sales');
        })->name('analytics.sales');
        Route::get('/analytics/expenses', function () {
            return Inertia::render('Dashboard/Analytics/Expenses');
        })->name('analytics.expenses');
        Route::get('/analytics/inventory', function () {
            return Inertia::render('Dashboard/Analytics/Inventory');
        })->name('analytics.inventory');
        Route::get('/analytics/mrp', function () {
            return Inertia::render('Dashboard/Analytics/Mrp');
        })->name('analytics.mrp');

        // Actions
        Route::get('/actions/create', function () {
            return Inertia::render('Dashboard/Actions/Create');
        })->name('actions.create');
        Route::get('/actions/approvals', function () {
            return Inertia::render('Dashboard/Actions/Approvals');
        })->name('actions.approvals');

        // Activities & News
        Route::get('/activity', function () {
            return Inertia::render('Dashboard/Activity');
        })->name('activity');
        Route::get('/news', function () {
            return Inertia::render('Dashboard/News');
        })->name('news');

        // Agenda
        Route::get('/agenda/deadlines', function () {
            return Inertia::render('Dashboard/Agenda/Deadlines');
        })->name('agenda.deadlines');
        Route::get('/agenda/maintenance', function () {
            return Inertia::render('Dashboard/Agenda/Maintenance');
        })->name('agenda.maintenance');
        Route::get('/agenda/milestones', function () {
            return Inertia::render('Dashboard/Agenda/Milestones');
        })->name('agenda.milestones');
    });

    Route::prefix('inventory')->name('inventory.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('Inventory/Dashboard');
        })->name('dashboard');

        // Analytics
        Route::get('/analytics/valuation', function () {
            return Inertia::render('Inventory/Analytics/Valuation');
        })->name('analytics.valuation');
        Route::get('/analytics/turnover', function () {
            return Inertia::render('Inventory/Analytics/Turnover');
        })->name('analytics.turnover');
        Route::get('/analytics/occupancy', function () {
            return Inertia::render('Inventory/Analytics/Occupancy');
        })->name('analytics.occupancy');
        Route::get('/analytics/status', function () {
            return Inertia::render('Inventory/Analytics/Status');
        })->name('analytics.status');

        // Master Data
        Route::get('/warehouses', [\App\Http\Controllers\Inventory\WarehouseController::class, 'index'])->name('warehouses.index');
        Route::get('/moves', [\App\Http\Controllers\Inventory\StockMoveController::class, 'index'])->name('moves.index');
        Route::get('/locations', function () {
            return Inertia::render('Inventory/Locations/Index');
        })->name('locations.index');
        Route::get('/products', function () {
            return Inertia::render('Inventory/Products/Index');
        })->name('products.index');
        Route::get('/rules', function () {
            return Inertia::render('Inventory/Rules/Index');
        })->name('rules.index');

        // Inbound
        Route::prefix('inbound')->name('inbound.')->group(function () {
            Route::get('/receipts', [\App\Http\Controllers\Inventory\InboundController::class, 'index'])->name('receipts');
            Route::get('/qc', [\App\Http\Controllers\Inventory\InboundController::class, 'qc'])->name('qc');

            // QC Inspection Actions
            Route::get('/qc/{item}/inspect', [\App\Http\Controllers\Inventory\QcController::class, 'show'])->name('qc.show');
            Route::post('/qc/{item}/inspect', [\App\Http\Controllers\Inventory\QcController::class, 'store'])->name('qc.store');

            Route::get('/cross-dock', [\App\Http\Controllers\Inventory\InboundController::class, 'crossDock'])->name('cross-dock');
            Route::get('/landed-costs', [\App\Http\Controllers\Inventory\InboundController::class, 'landedCosts'])->name('landed-costs');
        });

        // General Ledger
        Route::prefix('gl')->name('gl.')->group(function () {

            Route::get('/audit', [\App\Http\Controllers\Accounting\GlController::class, 'audit'])->name('audit');
            Route::get('/templates', [\App\Http\Controllers\Accounting\GlController::class, 'templates'])->name('templates');
        });

        // Internal
        Route::prefix('internal')->name('internal.')->group(function () {
            Route::get('/transfers', function () {
                return Inertia::render('Inventory/Internal/Transfers');
            })->name('transfers');
            Route::get('/adjustments', function () {
                return Inertia::render('Inventory/Internal/Adjustments');
            })->name('adjustments');
            Route::get('/scrap', function () {
                return Inertia::render('Inventory/Internal/Scrap');
            })->name('scrap');
            Route::get('/replenishment', function () {
                return Inertia::render('Inventory/Internal/Replenishment');
            })->name('replenishment');
        });

        // Outbound
        Route::prefix('outbound')->name('outbound.')->group(function () {
            Route::get('/picking', [\App\Http\Controllers\Inventory\OutboundController::class, 'picking'])->name('picking');
            Route::get('/picking/{delivery}/process', [\App\Http\Controllers\Inventory\OutboundController::class, 'pickingShow'])->name('picking.show');
            Route::post('/picking/{delivery}/process', [\App\Http\Controllers\Inventory\OutboundController::class, 'pickingStore'])->name('picking.store');
            Route::get('/waves', [\App\Http\Controllers\Inventory\OutboundController::class, 'waves'])->name('waves');
            Route::get('/shipping', [\App\Http\Controllers\Inventory\OutboundController::class, 'shipping'])->name('shipping');
            Route::get('/backorders', [\App\Http\Controllers\Inventory\OutboundController::class, 'backorders'])->name('backorders');
        });

        Route::prefix('control')->name('control.')->group(function () {
            Route::get('/cycle-count', [\App\Http\Controllers\Inventory\ControlController::class, 'cycleCount'])->name('cycle-count');
            Route::get('/expiry', [\App\Http\Controllers\Inventory\ControlController::class, 'expiry'])->name('expiry');
            Route::get('/lots', [\App\Http\Controllers\Inventory\ControlController::class, 'lots'])->name('lots');
            Route::get('/opname', [\App\Http\Controllers\Inventory\ControlController::class, 'opname'])->name('opname');
        });

        // Advanced
        Route::prefix('advanced')->name('advanced.')->group(function () {
            Route::get('/reordering', function () {
                return Inertia::render('Inventory/Advanced/Reordering');
            })->name('reordering');
            Route::get('/forecasting', function () {
                return Inertia::render('Inventory/Advanced/Forecasting');
            })->name('forecasting');
            Route::get('/kitting', function () {
                return Inertia::render('Inventory/Advanced/Kitting');
            })->name('kitting');
        });
    });

    Route::get('/sales', function () {
        return Inertia::render('Sales/Dashboard');
    })->name('sales.dashboard');

    Route::prefix('purchasing')->name('purchasing.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('Purchasing/Dashboard');
        })->name('dashboard');

        // Specific routes MUST come before resource routes
        // Specific routes MUST come before resource routes
        Route::get('/orders/versions', [\App\Http\Controllers\Purchasing\PurchaseOrderVersionController::class, 'index'])->name('orders.versions');

        Route::get('/contracts/alerts', function () {
            return Inertia::render('Purchasing/Contracts/Alerts');
        })->name('contracts.alerts');

        Route::resource('orders', PurchaseOrderController::class);
        Route::resource('contracts', PurchaseAgreementController::class);
        Route::post('contracts/{contract}/submit', [PurchaseAgreementController::class, 'submit'])->name('contracts.submit');
        Route::post('contracts/{contract}/approve', [PurchaseAgreementController::class, 'approve'])->name('contracts.approve');
        Route::post('contracts/{contract}/hold', [PurchaseAgreementController::class, 'hold'])->name('contracts.hold');
        Route::post('contracts/{contract}/resume', [PurchaseAgreementController::class, 'resume'])->name('contracts.resume');
        Route::post('contracts/{contract}/cancel', [PurchaseAgreementController::class, 'cancel'])->name('contracts.cancel');
        Route::post('contracts/{contract}/close', [PurchaseAgreementController::class, 'close'])->name('contracts.close');
        Route::post('contracts/{contract}/revise', [PurchaseAgreementController::class, 'revise'])->name('contracts.revise');
        Route::resource('blanket-orders', BlanketOrderController::class);
        Route::post('/blanket-orders/{blanket_order}/submit', [BlanketOrderController::class, 'submit'])->name('blanket-orders.submit');
        Route::post('/blanket-orders/{blanket_order}/approve', [BlanketOrderController::class, 'approve'])->name('blanket-orders.approve');
        Route::post('/blanket-orders/{blanket_order}/send', [BlanketOrderController::class, 'send'])->name('blanket-orders.send');
        Route::post('/blanket-orders/{blanket_order}/activate', [BlanketOrderController::class, 'activate'])->name('blanket-orders.activate');
        Route::post('/blanket-orders/{blanket_order}/close', [BlanketOrderController::class, 'close'])->name('blanket-orders.close');
        Route::post('/blanket-orders/{blanket_order}/revise', [BlanketOrderController::class, 'revise'])->name('blanket-orders.revise');
        Route::post('/blanket-orders/{blanket_order}/cancel', [BlanketOrderController::class, 'cancel'])->name('blanket-orders.cancel');

        // Status action routes
        Route::post('orders/{order}/submit', [PurchaseOrderController::class, 'submit'])->name('orders.submit');
        Route::post('orders/{order}/approve', [PurchaseOrderController::class, 'approve'])->name('orders.approve');
        Route::post('orders/{order}/cancel', [PurchaseOrderController::class, 'cancel'])->name('orders.cancel');
        Route::get('orders/{order}/print', [PurchaseOrderController::class, 'print'])->name('orders.print');

        // Version Control
        Route::get('orders/{order}/versions', [\App\Http\Controllers\Purchasing\PurchaseOrderVersionController::class, 'history'])->name('orders.versions.history');
        Route::get('orders/versions/{version}', [\App\Http\Controllers\Purchasing\PurchaseOrderVersionController::class, 'show'])->name('orders.versions.show');
        Route::get('orders/versions/{version}/compare/{other}', [\App\Http\Controllers\Purchasing\PurchaseOrderVersionController::class, 'compare'])->name('orders.versions.compare');
        Route::post('orders/versions/{version}/restore', [\App\Http\Controllers\Purchasing\PurchaseOrderVersionController::class, 'restore'])->name('orders.versions.restore');

        // Purchase Requests
        // Purchase Requests
        Route::post('requests/{request}/submit', [\App\Http\Controllers\Purchasing\PurchaseRequestController::class, 'submit'])
            ->name('requests.submit');
        Route::post('requests/{request}/convert', [\App\Http\Controllers\Purchasing\PurchaseRequestController::class, 'convertToPO'])
            ->name('requests.convert');
        Route::resource('requests', \App\Http\Controllers\Purchasing\PurchaseRequestController::class);

        // Vendor Onboarding Workflow - MUST come before resource route
        Route::prefix('vendors/onboarding')->name('vendors.onboarding.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Purchasing\VendorOnboardingController::class, 'index'])->name('index');
            Route::get('/{vendor}', [\App\Http\Controllers\Purchasing\VendorOnboardingController::class, 'show'])->name('show');
            Route::post('/{onboarding}/checklist', [\App\Http\Controllers\Purchasing\VendorOnboardingController::class, 'updateChecklist'])->name('checklist.update');
            Route::post('/{onboarding}/submit', [\App\Http\Controllers\Purchasing\VendorOnboardingController::class, 'submitForReview'])->name('submit');
            Route::post('/{onboarding}/approve', [\App\Http\Controllers\Purchasing\VendorOnboardingController::class, 'approve'])->name('approve');
            Route::post('/{onboarding}/reject', [\App\Http\Controllers\Purchasing\VendorOnboardingController::class, 'reject'])->name('reject');
        });

        Route::get('vendors/audits', [\App\Http\Controllers\Purchasing\VendorController::class, 'audits'])->name('vendors.audits');
        Route::post('vendors/audits', [\App\Http\Controllers\Purchasing\VendorAuditController::class, 'store'])->name('vendors.audits.store');
        Route::get('vendors/audits/{audit}', [\App\Http\Controllers\Purchasing\VendorAuditController::class, 'show'])->name('vendors.audits.show');
        Route::put('vendors/audits/{audit}', [\App\Http\Controllers\Purchasing\VendorAuditController::class, 'update'])->name('vendors.audits.update');
        Route::get('vendors/scorecards', [\App\Http\Controllers\Purchasing\VendorController::class, 'scorecards'])->name('vendors.scorecards');

        Route::resource('vendors', \App\Http\Controllers\Purchasing\VendorController::class);
        Route::resource('payment-terms', \App\Http\Controllers\Finance\PaymentTermController::class);

        Route::resource('receipts', GoodsReceiptController::class);
        Route::post('receipts/{receipt}/post', [GoodsReceiptController::class, 'post'])->name('receipts.post');
        // Landed Cost routes
        Route::post('receipts/{receipt}/landed-costs', [GoodsReceiptController::class, 'storeLandedCost'])->name('receipts.landed-costs.store');
        Route::delete('receipts/{receipt}/landed-costs/{landedCost}', [GoodsReceiptController::class, 'destroyLandedCost'])->name('receipts.landed-costs.destroy');
        // QC routes
        Route::post('receipts/{receipt}/qc/{item}/start', [GoodsReceiptController::class, 'startQc'])->name('receipts.qc.start');
        Route::post('receipts/{receipt}/qc/{item}/inspect', [GoodsReceiptController::class, 'recordQcInspection'])->name('receipts.qc.inspect');

        // Purchase Returns
        Route::post('returns/{return}/post', [\App\Http\Controllers\Purchasing\PurchaseReturnController::class, 'post'])->name('returns.post');
        Route::resource('returns', \App\Http\Controllers\Purchasing\PurchaseReturnController::class);

        // Price Lists
        Route::get('pricelists/get-price', [\App\Http\Controllers\Purchasing\PricelistController::class, 'getPrice'])->name('pricelists.get-price');
        Route::resource('pricelists', \App\Http\Controllers\Purchasing\PricelistController::class);

        // Document Flow Visualization
        Route::get('/document-flow/{type}/{id}', [\App\Http\Controllers\Purchasing\DocumentFlowController::class, 'show'])->name('document-flow.show');

        // RFQs
        Route::resource('rfqs', \App\Http\Controllers\Purchasing\RfqController::class);

        Route::post('rfqs/{rfq}/bid', [\App\Http\Controllers\Purchasing\RfqController::class, 'recordBid'])->name('rfqs.bid'); // Added bid route which was also implicitly needed
        Route::post('quotations/{quotation}/award', [\App\Http\Controllers\Purchasing\RfqController::class, 'award'])->name('quotations.award');

        Route::get('/', [\App\Http\Controllers\Purchasing\StrategyController::class, 'index'])->name('dashboard');

        // Strategy & Analytics
        Route::get('/analytics/spend', [\App\Http\Controllers\Purchasing\StrategyController::class, 'spend'])->name('analytics.spend');
        Route::get('/analytics/compliance', [\App\Http\Controllers\Purchasing\StrategyController::class, 'compliance'])->name('analytics.compliance');
        Route::get('/analytics/pr-monitor', [\App\Http\Controllers\Purchasing\StrategyController::class, 'prMonitor'])->name('analytics.pr-monitor');

        // Sourcing & SRM
        // Note: /vendors index is handled by the resource route above

        // Operations
        Route::get('/requisitions', function () {
            return Inertia::render('Purchasing/Requisitions/Index');
        })->name('requisitions.index');

        // Receiving & QC
        Route::get('/receipts', function () {
            return Inertia::render('Purchasing/receipts/index');
        })->name('receipts.index');

        // Three-Way Matching
        Route::get('/matching', [\App\Http\Controllers\Purchasing\ThreeWayMatchingController::class, 'index'])->name('matching.index');
        Route::get('/matching/{match}', [\App\Http\Controllers\Purchasing\ThreeWayMatchingController::class, 'show'])->name('matching.show');
        Route::post('/matching/{match}/approve', [\App\Http\Controllers\Purchasing\ThreeWayMatchingController::class, 'approve'])->name('matching.approve');
        Route::post('/matching/{match}/rematch', [\App\Http\Controllers\Purchasing\ThreeWayMatchingController::class, 'rematch'])->name('matching.rematch');

        Route::get('/qc', [\App\Http\Controllers\Purchasing\QcController::class, 'index'])->name('qc.index');
        Route::get('/qc/{item}', [\App\Http\Controllers\Purchasing\QcController::class, 'show'])->name('qc.show');
        Route::post('/qc/{item}/record', [\App\Http\Controllers\Purchasing\QcController::class, 'record'])->name('qc.record');

        Route::get('/landed-costs', [\App\Http\Controllers\Purchasing\LandedCostController::class, 'index'])->name('landed-costs.index');

        Route::get('/direct', [\App\Http\Controllers\Purchasing\DirectPurchasingController::class, 'index'])->name('direct.index');
        Route::post('/direct', [\App\Http\Controllers\Purchasing\DirectPurchasingController::class, 'store'])->name('direct.store');

        // Purchase Returns (RMA)
        Route::resource('returns', \App\Http\Controllers\Purchasing\PurchaseReturnController::class);
        Route::post('returns/{return}/authorize', [\App\Http\Controllers\Purchasing\PurchaseReturnController::class, 'authorize'])->name('returns.authorize');
        Route::post('returns/{return}/ship', [\App\Http\Controllers\Purchasing\PurchaseReturnController::class, 'ship'])->name('returns.ship');
        Route::post('returns/{return}/receive', [\App\Http\Controllers\Purchasing\PurchaseReturnController::class, 'receiveByVendor'])->name('returns.receive');
        Route::post('returns/{return}/complete', [\App\Http\Controllers\Purchasing\PurchaseReturnController::class, 'complete'])->name('returns.complete');
        Route::post('returns/{return}/cancel', [\App\Http\Controllers\Purchasing\PurchaseReturnController::class, 'cancel'])->name('returns.cancel');

        // Debit Notes
        Route::resource('debit-notes', \App\Http\Controllers\Purchasing\DebitNoteController::class);
        Route::post('debit-notes/{debitNote}/post', [\App\Http\Controllers\Purchasing\DebitNoteController::class, 'post'])->name('debit-notes.post');
        Route::post('debit-notes/{debitNote}/apply', [\App\Http\Controllers\Purchasing\DebitNoteController::class, 'apply'])->name('debit-notes.apply');
        Route::post('debit-notes/{debitNote}/void', [\App\Http\Controllers\Purchasing\DebitNoteController::class, 'void'])->name('debit-notes.void');

        // Vendor Claims
        Route::resource('claims', \App\Http\Controllers\Purchasing\VendorClaimController::class);
        Route::post('claims/{claim}/review', [\App\Http\Controllers\Purchasing\VendorClaimController::class, 'review'])->name('claims.review');
        Route::post('claims/{claim}/approve', [\App\Http\Controllers\Purchasing\VendorClaimController::class, 'approve'])->name('claims.approve');
        Route::post('claims/{claim}/dispute', [\App\Http\Controllers\Purchasing\VendorClaimController::class, 'dispute'])->name('claims.dispute');
        Route::post('claims/{claim}/settle', [\App\Http\Controllers\Purchasing\VendorClaimController::class, 'settle'])->name('claims.settle');
        Route::post('claims/{claim}/reject', [\App\Http\Controllers\Purchasing\VendorClaimController::class, 'reject'])->name('claims.reject');

        // Strategic Reporting
        Route::get('/reports/variance', [\App\Http\Controllers\Purchasing\ReportController::class, 'priceVariance'])->name('reports.variance');
        Route::get('/reports/aging', [\App\Http\Controllers\Purchasing\ReportController::class, 'openPoAging'])->name('reports.aging');
        Route::get('/reports/history', [\App\Http\Controllers\Purchasing\ReportController::class, 'historyAnalytics'])->name('reports.history');

        // Documentation
        Route::get('/documentation', function () {
            return Inertia::render('Purchasing/Documentation/Index');
        })->name('documentation.index');

        Route::get('/documentation/rfq-guide', function () {
            return Inertia::render('Purchasing/Documentation/RfqGuide');
        })->name('purchasing.documentation.rfq-guide');

        Route::get('/documentation/returns-guide', function () {
            return Inertia::render('Purchasing/Documentation/ReturnsClaimsGuide');
        })->name('purchasing.documentation.returns-guide');

        Route::get('/documentation/operations-guide', function () {
            return Inertia::render('Purchasing/Documentation/PurchasingOperationsGuide');
        })->name('purchasing.documentation.operations-guide');

        Route::get('/documentation/contracts-guide', function () {
            return Inertia::render('Purchasing/Documentation/ContractsGuide');
        })->name('documentation.contracts-guide');

        Route::get('/documentation/receiving-guide', function () {
            return Inertia::render('Purchasing/Documentation/ReceivingGuide');
        })->name('documentation.receiving-guide');

        Route::get('/documentation/analytics-guide', function () {
            return Inertia::render('Purchasing/Documentation/AnalyticsGuide');
        })->name('documentation.analytics-guide');

        Route::get('/documentation/rfq-guide', function () {
            return Inertia::render('Purchasing/Documentation/RfqGuide');
        })->name('documentation.rfq-guide');
    });

    Route::prefix('sales')->name('sales.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('Sales/Dashboard');
        })->name('dashboard');

        // Intelligence
        Route::get('/analytics/pipeline', function () {
            return Inertia::render('Sales/Analytics/Pipeline');
        })->name('analytics.pipeline');
        Route::get('/analytics/forecast', function () {
            return Inertia::render('Sales/Analytics/Forecast');
        })->name('analytics.forecast');
        Route::get('/analytics/win-loss', function () {
            return Inertia::render('Sales/Analytics/WinLoss');
        })->name('analytics.win-loss');
        Route::get('/analytics/activities', function () {
            return Inertia::render('Sales/Analytics/Activities');
        })->name('analytics.activities');

        // CRM
        Route::resource('leads', \App\Http\Controllers\Sales\Crm\LeadController::class);
        Route::post('deals/{deal}/update-stage', [\App\Http\Controllers\Sales\Crm\DealController::class, 'updateStage'])->name('deals.update-stage');
        Route::resource('deals', \App\Http\Controllers\Sales\Crm\DealController::class);
        Route::get('/customers', function () {
            return Inertia::render('Sales/Crm/Customers');
        })->name('customers.index');
        Route::get('/campaigns', function () {
            return Inertia::render('Sales/Crm/Campaigns');
        })->name('campaigns.index');
        Route::get('/contacts', function () {
            return Inertia::render('Sales/Crm/Contacts');
        })->name('contacts.index');

        // Operations
        Route::resource('price-lists', \App\Http\Controllers\Sales\Operations\PriceListController::class);
        Route::resource('quotations', \App\Http\Controllers\Sales\Operations\QuotationController::class);
        Route::resource('orders', \App\Http\Controllers\Sales\SalesOrderController::class);
        Route::get('/contracts', function () {
            return Inertia::render('Sales/Operations/Contracts');
        })->name('contracts.index');
        Route::get('/contracts', function () {
            return Inertia::render('Sales/Operations/Contracts');
        })->name('contracts.index');
        Route::get('/suggestions', function () {
            return Inertia::render('Sales/Operations/Suggestions');
        })->name('suggestions.index');

        // SFA
        Route::get('/territories', function () {
            return Inertia::render('Sales/Sfa/Territories');
        })->name('territories.index');
        Route::get('/commissions', function () {
            return Inertia::render('Sales/Sfa/Commissions');
        })->name('commissions.index');
        Route::get('/routes', function () {
            return Inertia::render('Sales/Sfa/Routes');
        })->name('routes.index');
        Route::get('/visits', function () {
            return Inertia::render('Sales/Sfa/Visits');
        })->name('visits.index');

        // Multi-Channel
        Route::get('/sync', function () {
            return Inertia::render('Sales/Channels/Sync');
        })->name('sync.index');
        Route::get('/atp', function () {
            return Inertia::render('Sales/Channels/Atp');
        })->name('atp.index');
        Route::get('/credit-check', function () {
            return Inertia::render('Sales/Channels/CreditCheck');
        })->name('credit-check.index');
        Route::get('/delivery', function () {
            return Inertia::render('Sales/Channels/Delivery');
        })->name('delivery.index');

        // Portal
        Route::get('/portal/orders', function () {
            return Inertia::render('Sales/Portal/Orders');
        })->name('portal.orders');
        Route::get('/portal/payments', function () {
            return Inertia::render('Sales/Portal/Payments');
        })->name('portal.payments');
        Route::get('/portal/documents', function () {
            return Inertia::render('Sales/Portal/Documents');
        })->name('portal.documents');
    });

    Route::prefix('accounting')->name('accounting.')->group(function () {
        // Financial Intelligence (Phase 1)
        Route::get('/', [\App\Http\Controllers\Accounting\DashboardController::class, 'index'])->name('dashboard');
        Route::get('/analytics/ratios', [\App\Http\Controllers\Accounting\Analytics\RatioController::class, 'index'])->name('analytics.ratios');
        Route::get('/analytics/pl', [\App\Http\Controllers\Accounting\Analytics\PLAnalyticsController::class, 'index'])->name('analytics.pl');

        // Legacy analytics routes (to be deprecated or reorganized)
        Route::get('/analytics/cashflow', function () {
            return Inertia::render('Accounting/Analytics/CashFlow');
        })->name('analytics.cashflow');
        Route::get('/analytics/budget', function () {
            return Inertia::render('Accounting/Analytics/Budget');
        })->name('analytics.budget');

        // General Ledger (Phase 2)

        Route::resource('coa', \App\Http\Controllers\Accounting\ChartOfAccountController::class);
        Route::resource('journal-entries', \App\Http\Controllers\Accounting\JournalEntryController::class);

        // Journal Templates
        Route::resource('templates', \App\Http\Controllers\Accounting\JournalTemplateController::class);
        Route::resource('posting-rules', \App\Http\Controllers\Accounting\PostingRuleController::class);

        // Opening Balances
        Route::get('beginning-balance/create', [\App\Http\Controllers\Accounting\BeginningBalanceController::class, 'create'])->name('beginning-balance.create');
        Route::post('beginning-balance', [\App\Http\Controllers\Accounting\BeginningBalanceController::class, 'store'])->name('beginning-balance.store');

        // Credit/Debit Notes
        Route::resource('notes', \App\Http\Controllers\Accounting\CreditDebitNoteController::class);
        Route::post('/notes/{note}/post', [\App\Http\Controllers\Accounting\CreditDebitNoteController::class, 'post'])->name('notes.post');
        Route::post('/notes/{note}/void', [\App\Http\Controllers\Accounting\CreditDebitNoteController::class, 'void'])->name('notes.void');
        Route::get('/audit', function () {
            // For now, return static data. In production, implement proper audit logging
            return Inertia::render('Accounting/Audit/Index', [
                'auditLogs' => [
                    'data' => [],
                    'links' => [],
                    'current_page' => 1,
                    'last_page' => 1,
                ],
                'filters' => request()->only(['search', 'action', 'date_from', 'date_to']),
            ]);
        })->name('audit.index');

        // Closing & Reporting
        Route::get('/periods', [PeriodController::class, 'index'])->name('periods.index');
        Route::post('/periods', [PeriodController::class, 'store'])->name('periods.store');
        Route::patch('/periods/{period}', [PeriodController::class, 'update'])->name('periods.update');
        Route::delete('/periods/{period}', [PeriodController::class, 'destroy'])->name('periods.destroy');
        Route::post('/periods/{period}/lock', [PeriodController::class, 'lock'])->name('periods.lock');
        Route::post('/periods/{period}/unlock', [PeriodController::class, 'unlock'])->name('periods.unlock');

        Route::prefix('gl')->name('gl.')->group(function () {

            Route::get('/audit', [\App\Http\Controllers\Accounting\GlController::class, 'audit'])->name('audit');
            Route::get('/templates', [\App\Http\Controllers\Accounting\GlController::class, 'templates'])->name('templates');
        });

        // Financial Reports
        Route::prefix('reports')->name('reports.')->group(function () {
            Route::get('/general-ledger', [\App\Http\Controllers\Accounting\Reports\GeneralLedgerController::class, 'index'])->name('general-ledger');
            Route::get('/general-ledger/export', [\App\Http\Controllers\Accounting\Reports\GeneralLedgerController::class, 'export'])->name('general-ledger.export');

            Route::get('/trial-balance', [\App\Http\Controllers\Accounting\Reports\TrialBalanceController::class, 'index'])->name('trial-balance');
            Route::get('/trial-balance/export', [\App\Http\Controllers\Accounting\Reports\TrialBalanceController::class, 'export'])->name('trial-balance.export');

            Route::get('/balance-sheet', [\App\Http\Controllers\Accounting\Reports\BalanceSheetController::class, 'index'])->name('balance-sheet');
            Route::get('/balance-sheet/export', [\App\Http\Controllers\Accounting\Reports\BalanceSheetController::class, 'export'])->name('balance-sheet.export');

            Route::get('/profit-loss', [\App\Http\Controllers\Accounting\Reports\ProfitLossController::class, 'index'])->name('profit-loss');
            Route::get('/profit-loss/export', [\App\Http\Controllers\Accounting\Reports\ProfitLossController::class, 'export'])->name('profit-loss.export');

            Route::get('/cash-flow', [\App\Http\Controllers\Accounting\Reports\CashFlowController::class, 'index'])->name('cash-flow');
            Route::get('/cash-flow/export', [\App\Http\Controllers\Accounting\Reports\CashFlowController::class, 'export'])->name('cash-flow.export');
        });

        // Accounts Receivable
        Route::post('/ar/invoices/{invoice}/post', [\App\Http\Controllers\Accounting\CustomerInvoiceController::class, 'post'])->name('ar.invoices.post');
        Route::resource('/ar/invoices', \App\Http\Controllers\Accounting\CustomerInvoiceController::class, ['as' => 'ar']);

        Route::post('/ar/payments/{payment}/post', [\App\Http\Controllers\Accounting\CustomerPaymentController::class, 'post'])->name('ar.payments.post');
        Route::resource('/ar/payments', \App\Http\Controllers\Accounting\CustomerPaymentController::class, ['as' => 'ar']);

        Route::get('/ar/matching', function () {
            return Inertia::render('Accounting/Ar/Matching');
        })->name('ar.matching');
        Route::get('/ar/aging', function () {
            return Inertia::render('Accounting/Ar/Aging');
        })->name('ar.aging');
        Route::get('/ar/dunning', function () {
            return Inertia::render('Accounting/Ar/Dunning');
        })->name('ar.dunning');
        Route::get('/ar/credit', function () {
            return Inertia::render('Accounting/Ar/Credit');
        })->name('ar.credit');

        // Accounts Payable
        Route::get('/ap/bills', function () {
            return Inertia::render('Accounting/Ap/Bills');
        })->name('ap.bills');
        Route::get('/ap/payments', function () {
            return Inertia::render('Accounting/Ap/Payments');
        })->name('ap.payments');
        Route::get('/ap/aging', function () {
            return Inertia::render('Accounting/Ap/Aging');
        })->name('ap.aging');
        Route::get('/ap/debit-notes', function () {
            return Inertia::render('Accounting/Ap/DebitNotes');
        })->name('ap.debit-notes');

        // Consolidation
        Route::get('/consol/intercompany', function () {
            return Inertia::render('Accounting/Consol/Intercompany');
        })->name('consol.intercompany');
        Route::get('/consol/reports', function () {
            return Inertia::render('Accounting/Consol/Reports');
        })->name('consol.reports');
        Route::get('/consol/revaluation', function () {
            return Inertia::render('Accounting/Consol/Revaluation');
        })->name('consol.revaluation');

        // Tax Reports (SPT Masa PPN)
        Route::get('/tax/periods', [\App\Http\Controllers\Accounting\TaxReportController::class, 'index'])->name('tax.periods');
        Route::get('/tax/periods/{period}', [\App\Http\Controllers\Accounting\TaxReportController::class, 'show'])->name('tax.periods.show');
        Route::post('/tax/generate', [\App\Http\Controllers\Accounting\TaxReportController::class, 'generate'])->name('tax.generate');
        Route::post('/tax/periods/{period}/submit', [\App\Http\Controllers\Accounting\TaxReportController::class, 'submit'])->name('tax.periods.submit');
        Route::get('/tax/periods/{period}/export/{format}', [\App\Http\Controllers\Accounting\TaxReportController::class, 'export'])->name('tax.periods.export');

        // Asset & Tax
        Route::get('/assets/depreciation', function () {
            return Inertia::render('Accounting/Assets/Depreciation');
        })->name('assets.depreciation');
        Route::get('/tax', function () {
            return Inertia::render('Accounting/Tax/Index');
        })->name('tax.index');
        Route::get('/deferred', [\App\Http\Controllers\Accounting\DeferredScheduleController::class, 'index'])->name('deferred.index');
        Route::get('/deferred/create', [\App\Http\Controllers\Accounting\DeferredScheduleController::class, 'create'])->name('deferred.create');
        Route::post('/deferred', [\App\Http\Controllers\Accounting\DeferredScheduleController::class, 'store'])->name('deferred.store');
        Route::get('/deferred/{schedule}', [\App\Http\Controllers\Accounting\DeferredScheduleController::class, 'show'])->name('deferred.show');
        Route::post('/deferred/items/{item}/process', [\App\Http\Controllers\Accounting\DeferredScheduleController::class, 'processItem'])->name('deferred.process-item');

        // Bank & Cash
        Route::get('/bank/sync', function () {
            return Inertia::render('Accounting/Bank/Sync');
        })->name('bank.sync');
        Route::get('/bank/reconciliation', function () {
            return Inertia::render('Accounting/Bank/Reconciliation');
        })->name('bank.reconciliation');
        Route::get('/bank/reconciliation', function () {
            return Inertia::render('Accounting/Bank/Reconciliation');
        })->name('bank.reconciliation');
        // Route::get('/bank/petty-cash', function () { ... }) replaced by finance.petty-cash

        // Closing & Reporting
        // Period Management
        Route::resource('periods', \App\Http\Controllers\Accounting\PeriodController::class)->only(['index', 'store']);
        Route::post('periods/{period}/lock', [\App\Http\Controllers\Accounting\PeriodController::class, 'lock'])->name('periods.lock');
        Route::post('periods/{period}/unlock', [\App\Http\Controllers\Accounting\PeriodController::class, 'unlock'])
            ->name('periods.unlock');

        Route::get('/closing', function () {
            return Inertia::render('Accounting/Closing/Index');
        })->name('closing.index');

        Route::get('/reports', function () {
            return Inertia::render('Accounting/Reports/Index');
        })->name('reports.index');
        Route::get('/reports/analytical', function () {
            return Inertia::render('Accounting/Reports/Analytical');
        })->name('reports.analytical');
        Route::get('/audit/export', function () {
            return Inertia::render('Accounting/Audit/Export');
        })->name('audit.export');

        // Existing resource routes that should remain
        Route::resource('bills', \App\Http\Controllers\Accounting\VendorBillController::class);
        Route::get('bills/{bill}/print', [\App\Http\Controllers\Accounting\VendorBillController::class, 'print'])->name('bills.print');
        Route::post('bills/{bill}/post', [\App\Http\Controllers\Accounting\VendorBillController::class, 'post'])->name('bills.post');

        Route::resource('vendor-payments', \App\Http\Controllers\Accounting\VendorPaymentController::class);
        Route::get('vendor-payments/{payment}/print', [\App\Http\Controllers\Accounting\VendorPaymentController::class, 'print'])->name('vendor-payments.print');
        Route::get('vendor-payments/vendor/{vendor}/bills', [\App\Http\Controllers\Accounting\VendorPaymentController::class, 'getUnpaidBills'])
            ->name('vendor-payments.get-unpaid-bills');


        // OLD REPORT ROUTES - REPLACED by dedicated controllers in line 517-533
        // Route::prefix('reports')->name('reports.')->group(function () {
        //     Route::get('/trial-balance', [\App\Http\Controllers\Accounting\ReportController::class, 'trialBalance'])->name('tb');
        //     Route::get('/profit-loss', [\App\Http\Controllers\Accounting\ReportController::class, 'profitLoss'])->name('pl');
        //     Route::get('/balance-sheet', [\App\Http\Controllers\Accounting\ReportController::class, 'balanceSheet'])->name('bs');
        // });
    });

    // Finance Module (Budgets, etc.)
    Route::prefix('finance')->name('finance.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('Finance/Dashboard');
        })->name('dashboard');

        // Treasury / Bank Accounts
        Route::resource('treasury', \App\Http\Controllers\Finance\BankAccountController::class);
        Route::post('treasury/{bankAccount}/transaction', [\App\Http\Controllers\Finance\BankTransactionController::class, 'store'])->name('treasury.transaction');
        // Route::post('treasury/transfer', [\App\Http\Controllers\Finance\BankTransactionController::class, 'transfer'])->name('treasury.transfer'); // Deprecated by FundTransferController
        
        // Fund Transfers
        Route::get('transfers', [\App\Http\Controllers\Finance\FundTransferController::class, 'index'])->name('transfer.index');
        Route::post('transfers', [\App\Http\Controllers\Finance\FundTransferController::class, 'store'])->name('transfer.store');

        // Multi-Currency
        Route::get('currency', [\App\Http\Controllers\Finance\CurrencyController::class, 'index'])->name('currency.index');
        Route::post('currency', [\App\Http\Controllers\Finance\CurrencyController::class, 'store'])->name('currency.store');
        Route::put('currency/{currency}', [\App\Http\Controllers\Finance\CurrencyController::class, 'update'])->name('currency.update');
        Route::post('currency/rates', [\App\Http\Controllers\Finance\CurrencyController::class, 'storeRate'])->name('currency.rate.store');
        
        // Petty Cash
        Route::resource('petty-cash', \App\Http\Controllers\Finance\PettyCashController::class);

        // Reconciliation
        Route::resource('reconciliation', \App\Http\Controllers\Finance\BankReconciliationController::class);
        Route::post('reconciliation/{reconciliation}/finalize', [\App\Http\Controllers\Finance\BankReconciliationController::class, 'finalize'])->name('reconciliation.finalize');

        Route::resource('budgets', \App\Http\Controllers\Finance\BudgetController::class);
        Route::post('budgets/check', [\App\Http\Controllers\Finance\BudgetController::class, 'checkBudget'])->name('budgets.check');

        // Analytics & Strategic
        Route::get('/forecast', function () { return Inertia::render('Finance/Placeholder', ['title' => 'Cash Flow Forecast']); })->name('forecast');
        Route::get('/ratios', function () { return Inertia::render('Finance/Placeholder', ['title' => 'Liquidity Ratios']); })->name('ratios');
        Route::get('/spend', function () { return Inertia::render('Finance/Placeholder', ['title' => 'Spend Analysis']); })->name('spend');

        // Budgeting sub-routes
        Route::prefix('budget')->name('budget.')->group(function () {
            Route::get('/planning', function () { return redirect()->route('finance.budgets.index'); })->name('planning');
            Route::get('/allocation', function () { return Inertia::render('Finance/Placeholder', ['title' => 'Budget Allocation']); })->name('allocation');
            Route::get('/monitoring', function () { return Inertia::render('Finance/Placeholder', ['title' => 'Budget Monitoring']); })->name('monitoring');
            Route::get('/variance', function () { return Inertia::render('Finance/Placeholder', ['title' => 'Budget Variance']); })->name('variance');
        });

        // Expense Management
        Route::prefix('expenses')->name('expenses.')->group(function () {
            Route::resource('reimbursements', \App\Http\Controllers\Finance\ExpenseClaimController::class);
            Route::post('reimbursements/{reimbursement}/submit', [\App\Http\Controllers\Finance\ExpenseClaimController::class, 'submit'])->name('reimbursements.submit');
            Route::post('reimbursements/{reimbursement}/approve', [\App\Http\Controllers\Finance\ExpenseClaimController::class, 'approve'])->name('reimbursements.approve');
            Route::post('reimbursements/{reimbursement}/reject', [\App\Http\Controllers\Finance\ExpenseClaimController::class, 'reject'])->name('reimbursements.reject');
            Route::post('reimbursements/{reimbursement}/pay', [\App\Http\Controllers\Finance\ExpenseClaimController::class, 'pay'])->name('reimbursements.pay');
            Route::get('/travel', function () { return Inertia::render('Finance/Placeholder', ['title' => 'Travel Expenses']); })->name('travel');
            Route::get('/cards', function () { return Inertia::render('Finance/Placeholder', ['title' => 'Corporate Cards']); })->name('cards');
        });
    });

    Route::get('/hrm', function () {
        return Inertia::render('HRM/Dashboard');
    })->name('hrm.dashboard');

    Route::get('/mrp', function () {
        return Inertia::render('Mrp/Dashboard');
    })->name('mrp.dashboard');

    Route::prefix('projects')->name('projects.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('Projects/Dashboard');
        })->name('dashboard');

        // Planning & Initiation
        Route::get('/charter', function () {
            return Inertia::render('Projects/Planning/Charter');
        })->name('charter');
        Route::get('/wbs', function () {
            return Inertia::render('Projects/Planning/Wbs');
        })->name('wbs');
        Route::get('/budget', function () {
            return Inertia::render('Projects/Planning/Budget');
        })->name('budget');
        Route::get('/milestones', function () {
            return Inertia::render('Projects/Planning/Milestones');
        })->name('milestones');

        // Resource Management
        Route::get('/resources/utilization', function () {
            return Inertia::render('Projects/Resources/Utilization');
        })->name('resources.utilization');
        Route::get('/resources/allocation', function () {
            return Inertia::render('Projects/Resources/Allocation');
        })->name('resources.allocation');
        Route::get('/timesheets', function () {
            return Inertia::render('Projects/Resources/Timesheets/Index');
        })->name('timesheets');
        Route::get('/timesheets/approval', function () {
            return Inertia::render('Projects/Resources/Timesheets/Approval');
        })->name('timesheets.approval');
        Route::get('/resources/external', function () {
            return Inertia::render('Projects/Resources/External');
        })->name('resources.external');

        // Execution & Tracking
        Route::get('/my-tasks', function () {
            return Inertia::render('Projects/Execution/MyTasks');
        })->name('my-tasks');
        Route::get('/kanban', function () {
            return Inertia::render('Projects/Execution/Kanban');
        })->name('kanban');
        Route::get('/issues', function () {
            return Inertia::render('Projects/Execution/Issues');
        })->name('issues');
        Route::get('/documents', function () {
            return Inertia::render('Projects/Execution/Documents');
        })->name('documents');
        Route::get('/collaboration', function () {
            return Inertia::render('Projects/Execution/Collaboration');
        })->name('collaboration');

        // Procurement
        Route::get('/procurement/requests', function () {
            return Inertia::render('Projects/Procurement/Requests');
        })->name('procurement.requests');
        Route::get('/procurement/subcontractors', function () {
            return Inertia::render('Projects/Procurement/Subcontractors');
        })->name('procurement.subcontractors');
        Route::get('/procurement/consumption', function () {
            return Inertia::render('Projects/Procurement/Consumption');
        })->name('procurement.consumption');

        // Billing & Finance
        Route::get('/financial', function () {
            return Inertia::render('Projects/Financial');
        })->name('financial');
        Route::get('/gantt', function () {
            return Inertia::render('Projects/Gantt');
        })->name('gantt');
        Route::get('/billing/revenue', function () {
            return Inertia::render('Projects/Billing/Revenue');
        })->name('billing.revenue');
        Route::get('/billing/milestones', function () {
            return Inertia::render('Projects/Billing/Milestones');
        })->name('billing.milestones');
        Route::get('/expenses', function () {
            return Inertia::render('Projects/Billing/Expenses');
        })->name('expenses');
        Route::get('/pnl', function () {
            return Inertia::render('Projects/Billing/Pnl');
        })->name('pnl');

        // Quality & Closing
        Route::get('/quality', function () {
            return Inertia::render('Projects/Quality/Checklist');
        })->name('quality');
        Route::get('/handover', function () {
            return Inertia::render('Projects/Quality/Handover');
        })->name('handover');
        Route::get('/closure', function () {
            return Inertia::render('Projects/Quality/Closure');
        })->name('closure');

        // Legacy/Existing (checking if these should be kept or replaced)
        Route::get('/list', function () {
            return Inertia::render('Projects/Index');
        })->name('list'); // Kept as general list
        Route::get('/tasks', function () {
            return Inertia::render('Projects/Execution/Tasks');
        })->name('tasks'); // Mapped to Execution
    });

    Route::prefix('assets')->name('assets.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('Assets/Dashboard');
        })->name('dashboard');

        // Dashboard & Analytics
        Route::get('/lifecycle', function () {
            return Inertia::render('Assets/Analytics/Lifecycle');
        })->name('lifecycle');
        Route::get('/maintenance-calendar', function () {
            return Inertia::render('Assets/Analytics/MaintenanceCalendar');
        })->name('maintenance-calendar');
        Route::get('/forecast', function () {
            return Inertia::render('Assets/Analytics/Forecast');
        })->name('forecast');

        // Registry
        Route::get('/list', function () {
            return Inertia::render('Assets/Registry/List');
        })->name('list');
        Route::get('/categories', function () {
            return Inertia::render('Assets/Registry/Categories');
        })->name('categories');
        Route::get('/locations', function () {
            return Inertia::render('Assets/Registry/Locations');
        })->name('locations');
        Route::get('/custodians', function () {
            return Inertia::render('Assets/Registry/Custodians');
        })->name('custodians');

        // Financial
        Route::get('/methods', function () {
            return Inertia::render('Assets/Financial/Methods');
        })->name('methods');
        Route::get('/revaluation', function () {
            return Inertia::render('Assets/Financial/Revaluation');
        })->name('revaluation');
        Route::get('/fiscal', function () {
            return Inertia::render('Assets/Financial/Fiscal');
        })->name('fiscal');
        Route::get('/components', function () {
            return Inertia::render('Assets/Financial/Components');
        })->name('components');

        // Operations
        Route::get('/acquisition', function () {
            return Inertia::render('Assets/Operations/Acquisition');
        })->name('acquisition');
        Route::get('/transfer', function () {
            return Inertia::render('Assets/Operations/Transfer');
        })->name('transfer');
        Route::get('/checkout', function () {
            return Inertia::render('Assets/Operations/Checkout');
        })->name('checkout');
        Route::get('/disposal', function () {
            return Inertia::render('Assets/Operations/Disposal');
        })->name('disposal');

        // Maintenance (EAM)
        Route::get('/preventive', function () {
            return Inertia::render('Assets/Maintenance/Preventive');
        })->name('preventive');
        Route::get('/work-orders', function () {
            return Inertia::render('Assets/Maintenance/WorkOrders');
        })->name('work-orders');
        Route::get('/insurance', function () {
            return Inertia::render('Assets/Maintenance/Insurance');
        })->name('insurance');
        Route::get('/warranty', function () {
            return Inertia::render('Assets/Maintenance/Warranty');
        })->name('warranty');

        // Audit
        Route::get('/audit/stock-take', function () {
            return Inertia::render('Assets/Audit/StockTake');
        })->name('audit.stock-take');
        Route::get('/audit/log', function () {
            return Inertia::render('Assets/Audit/Log');
        })->name('audit.log');
        Route::get('/documents', function () {
            return Inertia::render('Assets/Audit/Documents');
        })->name('documents');

        // Legacy/Existing Routes (to be refactored or kept)
        // Note: 'list' and 'depreciation' are covered or replaced above,
        // but 'depreciation' logic might be under financial or a separate tool.
        // For now, mapping 'depreciation' to the new 'methods' or 'forecast' depending on intent,
        // or keeping it if it points to a specific runner.
        Route::get('/depreciation', function () {
            return Inertia::render('Assets/Financial/DepreciationRunner');
        })->name('depreciation');
    });

    Route::prefix('pos')->name('pos.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('Pos/Dashboard');
        })->name('dashboard');

        // POS Operations
        Route::get('/sessions', function () {
            return Inertia::render('Pos/Operations/Sessions');
        })->name('sessions');
        Route::get('/sales', function () {
            return Inertia::render('Pos/Operations/SalesInterface');
        })->name('sales');
        Route::get('/orders', function () {
            return Inertia::render('Pos/Operations/Orders');
        })->name('orders');
        Route::get('/refunds', function () {
            return Inertia::render('Pos/Operations/Refunds');
        })->name('refunds');

        // Multi-Store
        Route::get('/branches', function () {
            return Inertia::render('Pos/MultiStore/Branches');
        })->name('branches');
        Route::get('/pricing', function () {
            return Inertia::render('Pos/MultiStore/Pricing');
        })->name('pricing');
        Route::get('/promotions', function () {
            return Inertia::render('Pos/MultiStore/Promotions');
        })->name('promotions');
        Route::get('/vouchers', function () {
            return Inertia::render('Pos/MultiStore/Vouchers');
        })->name('vouchers');

        // Inventory Integration
        Route::get('/inventory/transfers', function () {
            return Inertia::render('Pos/Inventory/Transfers');
        })->name('inventory.transfers');
        Route::get('/inventory/stock-take', function () {
            return Inertia::render('Pos/Inventory/StockTake');
        })->name('inventory.stock-take');
        Route::get('/inventory/requests', function () {
            return Inertia::render('Pos/Inventory/Requests');
        })->name('inventory.requests');

        // CRM
        Route::get('/customers', function () {
            return Inertia::render('Pos/Crm/Customers');
        })->name('customers');
        Route::get('/loyalty', function () {
            return Inertia::render('Pos/Crm/Loyalty');
        })->name('loyalty');
        Route::get('/membership', function () {
            return Inertia::render('Pos/Crm/Membership');
        })->name('membership');
        Route::get('/feedback', function () {
            return Inertia::render('Pos/Crm/Feedback');
        })->name('feedback');

        // Multi-Channel
        Route::get('/online-orders', function () {
            return Inertia::render('Pos/Channels/OnlineOrders');
        })->name('online-orders');
        Route::get('/delivery', function () {
            return Inertia::render('Pos/Channels/Delivery');
        })->name('delivery');
        Route::get('/kds', function () {
            return Inertia::render('Pos/Channels/Kds');
        })->name('kds');

        // Accounting
        // Using 'acct' prefix in component path to avoid confusion with main Accounting module if needed,
        // but sticking to 'Pos/Accounting' is cleaner.
        Route::get('/reports/journal', function () {
            return Inertia::render('Pos/Accounting/Journal');
        })->name('reports.journal');
        Route::get('/reports/tax', function () {
            return Inertia::render('Pos/Accounting/Tax');
        })->name('reports.tax');
        Route::get('/reports/discrepancy', function () {
            return Inertia::render('Pos/Accounting/Discrepancy');
        })->name('reports.discrepancy');

        // Analytics
        Route::get('/analytics/sales', function () {
            return Inertia::render('Pos/Analytics/SalesPerformance');
        })->name('analytics.sales');
        Route::get('/analytics/top-selling', function () {
            return Inertia::render('Pos/Analytics/TopSelling');
        })->name('analytics.top-selling');
        Route::get('/analytics/margin', function () {
            return Inertia::render('Pos/Analytics/Margin');
        })->name('analytics.margin');
    });

    Route::prefix('fleet')->name('fleet.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('Fleet/Dashboard');
        })->name('dashboard');

        // Analytics
        Route::get('/analytics/fuel', function () {
            return Inertia::render('Fleet/Analytics/Fuel');
        })->name('analytics.fuel');
        Route::get('/analytics/costs', function () {
            return Inertia::render('Fleet/Analytics/Costs');
        })->name('analytics.costs');
        Route::get('/analytics/telematics', function () {
            return Inertia::render('Fleet/Analytics/Telematics');
        })->name('analytics.telematics');

        // Master Data
        Route::get('/vehicles', function () {
            return Inertia::render('Fleet/Registry/Vehicles');
        })->name('vehicles');
        Route::get('/vehicles/assets', function () {
            return Inertia::render('Fleet/Registry/Assets');
        })->name('vehicles.assets');
        Route::get('/vehicles/odometer', function () {
            return Inertia::render('Fleet/Registry/Odometer');
        })->name('vehicles.odometer');
        Route::get('/vehicles/fuel-cards', function () {
            return Inertia::render('Fleet/Registry/FuelCards');
        })->name('vehicles.fuel-cards');

        // Driver & HR
        Route::get('/drivers', function () {
            return Inertia::render('Fleet/Drivers/Profiles');
        })->name('drivers');
        Route::get('/drivers/licenses', function () {
            return Inertia::render('Fleet/Drivers/Licenses');
        })->name('drivers.licenses');
        Route::get('/drivers/assignments', function () {
            return Inertia::render('Fleet/Drivers/Assignments');
        })->name('drivers.assignments');
        Route::get('/drivers/safety', function () {
            return Inertia::render('Fleet/Drivers/Safety');
        })->name('drivers.safety');

        // Maintenance
        Route::get('/maintenance/preventive', function () {
            return Inertia::render('Fleet/Maintenance/Preventive');
        })->name('maintenance.preventive');
        Route::get('/maintenance/orders', function () {
            return Inertia::render('Fleet/Maintenance/WorkOrders');
        })->name('maintenance.orders');
        Route::get('/maintenance/tires', function () {
            return Inertia::render('Fleet/Maintenance/Tires');
        })->name('maintenance.tires');
        Route::get('/maintenance/parts', function () {
            return Inertia::render('Fleet/Maintenance/Parts');
        })->name('maintenance.parts');

        // Fuel & Expenses
        Route::get('/expenses/fuel', function () {
            return Inertia::render('Fleet/Expenses/FuelLogs');
        })->name('expenses.fuel');
        Route::get('/expenses/claims', function () {
            return Inertia::render('Fleet/Expenses/Claims');
        })->name('expenses.claims');
        Route::get('/expenses/fines', function () {
            return Inertia::render('Fleet/Expenses/Fines');
        })->name('expenses.fines');

        // Operations
        Route::get('/operations/booking', function () {
            return Inertia::render('Fleet/Operations/Booking');
        })->name('operations.booking');
        Route::get('/operations/dispatch', function () {
            return Inertia::render('Fleet/Operations/Dispatch');
        })->name('operations.dispatch');
        Route::get('/operations/trips', function () {
            return Inertia::render('Fleet/Operations/Trips');
        })->name('operations.trips');

        // Compliance
        Route::get('/compliance/documents', function () {
            return Inertia::render('Fleet/Compliance/Documents');
        })->name('compliance.documents');
        Route::get('/compliance/insurance', function () {
            return Inertia::render('Fleet/Compliance/Insurance');
        })->name('compliance.insurance');
        Route::get('/compliance/tax', function () {
            return Inertia::render('Fleet/Compliance/Tax');
        })->name('compliance.tax');
    });

    Route::prefix('helpdesk')->name('helpdesk.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('Helpdesk/Dashboard');
        })->name('dashboard');

        // Analytics
        Route::get('/analytics/sla', function () {
            return Inertia::render('Helpdesk/Analytics/SlaPerformance');
        })->name('analytics.sla');
        Route::get('/analytics/workload', function () {
            return Inertia::render('Helpdesk/Analytics/Workload');
        })->name('analytics.workload');
        Route::get('/analytics/csat', function () {
            return Inertia::render('Helpdesk/Analytics/Csat');
        })->name('analytics.csat');

        // Ticket Management
        Route::get('/tickets', function () {
            return Inertia::render('Helpdesk/Tickets/All');
        })->name('tickets.index');
        Route::get('/tickets/my', function () {
            return Inertia::render('Helpdesk/Tickets/MyPipeline');
        })->name('tickets.my');
        Route::get('/tickets/team', function () {
            return Inertia::render('Helpdesk/Tickets/Team');
        })->name('tickets.team');
        Route::get('/tickets/views', function () {
            return Inertia::render('Helpdesk/Tickets/Views');
        })->name('tickets.views');

        // Omnichannel
        Route::get('/channels/email', function () {
            return Inertia::render('Helpdesk/Channels/Email');
        })->name('channels.email');
        Route::get('/channels/chat', function () {
            return Inertia::render('Helpdesk/Channels/Chat');
        })->name('channels.chat');
        Route::get('/channels/social', function () {
            return Inertia::render('Helpdesk/Channels/Social');
        })->name('channels.social');
        Route::get('/channels/portal', function () {
            return Inertia::render('Helpdesk/Channels/Portal');
        })->name('channels.portal');

        // SLA & Automation
        Route::get('/automation/sla', function () {
            return Inertia::render('Helpdesk/Automation/SlaPolicies');
        })->name('automation.sla');
        Route::get('/automation/assignment', function () {
            return Inertia::render('Helpdesk/Automation/Assignment');
        })->name('automation.assignment');
        Route::get('/automation/escalation', function () {
            return Inertia::render('Helpdesk/Automation/Escalation');
        })->name('automation.escalation');
        Route::get('/automation/triggers', function () {
            return Inertia::render('Helpdesk/Automation/Triggers');
        })->name('automation.triggers');

        // Knowledge Base
        Route::get('/knowledge/articles', function () {
            return Inertia::render('Helpdesk/Knowledge/Articles');
        })->name('knowledge.articles');
        Route::get('/knowledge/wiki', function () {
            return Inertia::render('Helpdesk/Knowledge/Wiki');
        })->name('knowledge.wiki');
        Route::get('/knowledge/canned', function () {
            return Inertia::render('Helpdesk/Knowledge/Canned');
        })->name('knowledge.canned');

        // Integration
        Route::get('/integration/onsite', function () {
            return Inertia::render('Helpdesk/Integration/Onsite');
        })->name('integration.onsite');
        Route::get('/integration/project', function () {
            return Inertia::render('Helpdesk/Integration/Project');
        })->name('integration.project');
        Route::get('/integration/rma', function () {
            return Inertia::render('Helpdesk/Integration/Rma');
        })->name('integration.rma');

        // Reporting
        Route::get('/reports/resolution', function () {
            return Inertia::render('Helpdesk/Reports/Resolution');
        })->name('reports.resolution');
        Route::get('/reports/recurring', function () {
            return Inertia::render('Helpdesk/Reports/Recurring');
        })->name('reports.recurring');
        Route::get('/reports/audit', function () {
            return Inertia::render('Helpdesk/Reports/Audit');
        })->name('reports.audit');
    });

    Route::prefix('bi')->name('bi.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('Bi/Dashboard');
        })->name('dashboard');

        // Executive
        Route::get('/executive/scorecard', function () {
            return Inertia::render('Bi/Executive/Scorecard');
        })->name('executive.scorecard');
        Route::get('/executive/financial', function () {
            return Inertia::render('Bi/Executive/Financial');
        })->name('executive.financial');
        Route::get('/executive/market', function () {
            return Inertia::render('Bi/Executive/Market');
        })->name('executive.market');
        Route::get('/executive/capex', function () {
            return Inertia::render('Bi/Executive/Capex');
        })->name('executive.capex');

        // Operations
        Route::get('/operations/sales', function () {
            return Inertia::render('Bi/Operations/Sales');
        })->name('operations.sales');
        Route::get('/operations/supply', function () {
            return Inertia::render('Bi/Operations/Supply');
        })->name('operations.supply');
        Route::get('/operations/hr', function () {
            return Inertia::render('Bi/Operations/Hr');
        })->name('operations.hr');
        Route::get('/operations/manufacturing', function () {
            return Inertia::render('Bi/Operations/Manufacturing');
        })->name('operations.manufacturing');

        // Financial
        Route::get('/financial/cashflow', function () {
            return Inertia::render('Bi/Financial/Cashflow');
        })->name('financial.cashflow');
        Route::get('/financial/profitability', function () {
            return Inertia::render('Bi/Financial/Profitability');
        })->name('financial.profitability');
        Route::get('/financial/budget', function () {
            return Inertia::render('Bi/Financial/Budget');
        })->name('financial.budget');
        Route::get('/financial/tax', function () {
            return Inertia::render('Bi/Financial/Tax');
        })->name('financial.tax');

        // Predictive
        Route::get('/predictive/demand', function () {
            return Inertia::render('Bi/Predictive/Demand');
        })->name('predictive.demand');
        Route::get('/predictive/fraud', function () {
            return Inertia::render('Bi/Predictive/Fraud');
        })->name('predictive.fraud');
        Route::get('/predictive/clv', function () {
            return Inertia::render('Bi/Predictive/Clv');
        })->name('predictive.clv');
        Route::get('/predictive/whatif', function () {
            return Inertia::render('Bi/Predictive/WhatIf');
        })->name('predictive.whatif');

        // Data
        Route::get('/data/sources', function () {
            return Inertia::render('Bi/Data/Sources');
        })->name('data.sources');
        Route::get('/data/warehouse', function () {
            return Inertia::render('Bi/Data/Warehouse');
        })->name('data.warehouse');
        Route::get('/data/mdm', function () {
            return Inertia::render('Bi/Data/Mdm');
        })->name('data.mdm');
        Route::get('/data/scheduler', function () {
            return Inertia::render('Bi/Data/Scheduler');
        })->name('data.scheduler');

        // Self-Service
        Route::get('/self/builder', function () {
            return Inertia::render('Bi/SelfService/Builder');
        })->name('self.builder');
        Route::get('/self/pivot', function () {
            return Inertia::render('Bi/SelfService/Pivot');
        })->name('self.pivot');
        Route::get('/self/queries', function () {
            return Inertia::render('Bi/SelfService/Queries');
        })->name('self.queries');
    });

    Route::prefix('hrm')->name('hrm.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('HRM/Dashboard');
        })->name('dashboard');

        // HR Intelligence
        Route::get('/analytics/workforce', function () {
            return Inertia::render('HRM/Analytics/Workforce');
        })->name('analytics.workforce');
        Route::get('/analytics/turnover', function () {
            return Inertia::render('HRM/Analytics/Turnover');
        })->name('analytics.turnover');
        Route::get('/analytics/labor-cost', function () {
            return Inertia::render('HRM/Analytics/LaborCost');
        })->name('analytics.labor-cost');
        Route::get('/analytics/demographics', function () {
            return Inertia::render('HRM/Analytics/Demographics');
        })->name('analytics.demographics');

        // Personnel Data
        // Personnel Data
        Route::resource('employees', \App\Http\Controllers\HRM\EmployeeController::class);
        Route::get('/contracts', function () {
            return Inertia::render('HRM/Contracts/Index');
        })->name('contracts.index');
        Route::get('/org-chart', function () {
            return Inertia::render('HRM/Personnel/OrgChart');
        })->name('org-chart');
        Route::get('/assets', function () {
            return Inertia::render('HRM/Personnel/Assets');
        })->name('assets');

        // Time & Attendance
        Route::get('/attendance', [\App\Http\Controllers\HRM\AttendanceController::class, 'index'])->name('attendance.index');
        Route::post('/attendance', [\App\Http\Controllers\HRM\AttendanceController::class, 'store'])->name('attendance.store');
        Route::get('/leave', [\App\Http\Controllers\HRM\AttendanceController::class, 'leave'])->name('leave');

        // Payroll & Benefits
        Route::resource('payroll', \App\Http\Controllers\HRM\PayrollController::class);
        Route::get('/payroll/tax', function () {
            return Inertia::render('HRM/Payroll/Tax');
        })->name('payroll.tax');
        Route::get('/payroll/bpjs', function () {
            return Inertia::render('HRM/Payroll/Bpjs');
        })->name('payroll.bpjs');
        Route::get('/payroll/benefits', function () {
            return Inertia::render('HRM/Payroll/Benefits');
        })->name('payroll.benefits');
        Route::get('/payroll/payslips', function () {
            return Inertia::render('HRM/Payroll/Payslips');
        })->name('payroll.payslips');

        // Recruitment (ATS)
        Route::get('/jobs', function () {
            return Inertia::render('Hrm/Recruitment/Jobs');
        })->name('jobs');
        Route::get('/applicants', function () {
            return Inertia::render('Hrm/Recruitment/Applicants');
        })->name('applicants');
        Route::get('/onboarding', function () {
            return Inertia::render('Hrm/Recruitment/Onboarding');
        })->name('onboarding');

        // Talent & Performance
        Route::get('/performance', function () {
            return Inertia::render('Hrm/Performance/Index');
        })->name('performance');
        Route::get('/competency', function () {
            return Inertia::render('Hrm/Performance/Competency');
        })->name('competency');
        Route::get('/succession', function () {
            return Inertia::render('Hrm/Performance/Succession');
        })->name('succession');
        Route::get('/transfers', function () {
            return Inertia::render('Hrm/Performance/Transfers');
        })->name('transfers');

        // Learning & Development
        Route::get('/training', function () {
            return Inertia::render('Hrm/Training/Index');
        })->name('training');
        Route::get('/learning', function () {
            return Inertia::render('Hrm/Training/Learning');
        })->name('learning');
        Route::get('/training/budget', function () {
            return Inertia::render('Hrm/Training/Budget');
        })->name('training.budget');

        // Employee Portal (ESS)
        Route::get('/profile', function () {
            return Inertia::render('Hrm/Ess/Profile');
        })->name('profile');
        Route::get('/requests', function () {
            return Inertia::render('Hrm/Ess/Requests');
        })->name('requests');
        Route::get('/news', function () {
            return Inertia::render('Hrm/Ess/News');
        })->name('news');
    });

    Route::prefix('mrp')->name('mrp.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('Manufacturing/Dashboard');
        })->name('dashboard');

        // Production Strategy
        Route::get('/analytics/oee', function () {
            return Inertia::render('Manufacturing/Analytics/Oee');
        })->name('analytics.oee');
        Route::get('/analytics/overview', function () {
            return Inertia::render('Manufacturing/Analytics/Overview');
        })->name('analytics.overview');
        Route::get('/analytics/load', function () {
            return Inertia::render('Manufacturing/Analytics/Load');
        })->name('analytics.load');
        Route::get('/analytics/scrap', function () {
            return Inertia::render('Manufacturing/Analytics/Scrap');
        })->name('analytics.scrap');

        // Engineering
        Route::get('/bom', function () {
            return Inertia::render('Manufacturing/Bom/Index');
        })->name('bom.index');
        Route::get('/work-centers', function () {
            return Inertia::render('Manufacturing/WorkCenters/Index');
        })->name('work-centers.index');
        Route::get('/routings', function () {
            return Inertia::render('Manufacturing/Routings/Index');
        })->name('routings.index');
        Route::get('/variants', function () {
            return Inertia::render('Manufacturing/Variants/Index');
        })->name('variants.index');

        // Planning
        Route::get('/planning/mps', function () {
            return Inertia::render('Manufacturing/Planning/Mps');
        })->name('planning.mps');
        Route::get('/planning/run', function () {
            return Inertia::render('Manufacturing/Planning/Run');
        })->name('planning.run');
        Route::get('/planning/capacity', function () {
            return Inertia::render('Manufacturing/Planning/Capacity');
        })->name('planning.capacity');
        Route::get('/planning/scheduler', function () {
            return Inertia::render('Manufacturing/Planning/Scheduler');
        })->name('planning.scheduler');

        // Execution
        Route::get('/orders', function () {
            return Inertia::render('Manufacturing/Orders/Index');
        })->name('orders.index');
        Route::get('/work-orders', function () {
            return Inertia::render('Manufacturing/WorkOrders/Index');
        })->name('work-orders.index');
        Route::get('/tablet', function () {
            return Inertia::render('Manufacturing/Execution/Tablet');
        })->name('tablet');
        Route::get('/consumption', function () {
            return Inertia::render('Manufacturing/Execution/Consumption');
        })->name('consumption');

        // Quality & Maintenance
        Route::get('/quality/points', function () {
            return Inertia::render('Manufacturing/Quality/Points');
        })->name('quality.points');
        Route::get('/quality/inspections', function () {
            return Inertia::render('Manufacturing/Quality/Inspections');
        })->name('quality.inspections');
        Route::get('/maintenance', function () {
            return Inertia::render('Manufacturing/Quality/Maintenance');
        })->name('maintenance');
        Route::get('/quality/ncr', function () {
            return Inertia::render('Manufacturing/Quality/Ncr');
        })->name('quality.ncr');

        // Logistics
        Route::get('/logistics/pick', function () {
            return Inertia::render('Manufacturing/Logistics/Pick');
        })->name('logistics.pick');
        Route::get('/unbuild', function () {
            return Inertia::render('Manufacturing/Logistics/Unbuild');
        })->name('unbuild');
        Route::get('/logistics/finished', function () {
            return Inertia::render('Manufacturing/Logistics/Finished');
        })->name('logistics.finished');
        Route::get('/logistics/byproducts', function () {
            return Inertia::render('Manufacturing/Logistics/Byproducts');
        })->name('logistics.byproducts');

        // Costing
        Route::get('/costing/comparison', function () {
            return Inertia::render('Manufacturing/Costing/Comparison');
        })->name('costing.comparison');
        Route::get('/costing/workcenters', function () {
            return Inertia::render('Manufacturing/Costing/WorkCenters');
        })->name('costing.workcenters');
        Route::get('/costing/wip', function () {
            return Inertia::render('Manufacturing/Costing/Wip');
        })->name('costing.wip');
    });

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('Admin/Dashboard');
        })->name('dashboard');

        // User & Security
        Route::get('/users', function () {
            return Inertia::render('Admin/Users/Index');
        })->name('users');
        Route::get('/roles', function () {
            return Inertia::render('Admin/Users/Roles');
        })->name('roles');
        Route::get('/security/groups', function () {
            return Inertia::render('Admin/Security/Groups');
        })->name('security.groups');
        Route::get('/security/logs', function () {
            return Inertia::render('Admin/Security/Logs');
        })->name('security.logs');
        Route::get('/security/2fa', function () {
            return Inertia::render('Admin/Security/TwoFactor');
        })->name('security.2fa');

        // Multi-Entity
        Route::get('/company/profile', function () {
            return Inertia::render('Admin/Company/Profile');
        })->name('company.profile');
        Route::get('/company/hierarchy', function () {
            return Inertia::render('Admin/Company/Hierarchy');
        })->name('company.hierarchy');
        Route::get('/company/branches', function () {
            return Inertia::render('Admin/Company/Branches');
        })->name('company.branches');
        Route::get('/company/currency', function () {
            return Inertia::render('Admin/Company/Currency');
        })->name('company.currency');

        // Workflow
        Route::get('/workflow/designer', function () {
            return Inertia::render('Admin/Workflow/Designer');
        })->name('workflow.designer');
        Route::get('/workflow/cron', function () {
            return Inertia::render('Admin/Workflow/Cron');
        })->name('workflow.cron');
        Route::get('/workflow/notifications', function () {
            return Inertia::render('Admin/Workflow/Notifications');
        })->name('workflow.notifications');
        Route::get('/workflow/api', function () {
            return Inertia::render('Admin/Workflow/Api');
        })->name('workflow.api');

        // Data & Audit
        Route::get('/data/audit', function () {
            return Inertia::render('Admin/Data/Audit');
        })->name('data.audit');
        Route::get('/data/import-export', function () {
            return Inertia::render('Admin/Data/ImportExport');
        })->name('data.import-export');
        Route::get('/data/database', function () {
            return Inertia::render('Admin/Data/Database');
        })->name('data.database');
        Route::get('/data/archive', function () {
            return Inertia::render('Admin/Data/Archive');
        })->name('data.archive');

        // Customization
        Route::get('/custom/fields', function () {
            return Inertia::render('Admin/Customization/Fields');
        })->name('custom.fields');
        Route::get('/custom/forms', function () {
            return Inertia::render('Admin/Customization/Forms');
        })->name('custom.forms');
        Route::get('/custom/translation', function () {
            return Inertia::render('Admin/Customization/Translation');
        })->name('custom.translation');
        Route::get('/custom/menu', function () {
            return Inertia::render('Admin/Customization/Menu');
        })->name('custom.menu');

        // System Health
        Route::get('/health/logs', function () {
            return Inertia::render('Admin/Health/Logs');
        })->name('health.logs');
        Route::get('/health/integrations', function () {
            return Inertia::render('Admin/Health/Integrations');
        })->name('health.integrations');
        Route::get('/health/performance', function () {
            return Inertia::render('Admin/Health/Performance');
        })->name('health.performance');
        Route::get('/health/backup', function () {
            return Inertia::render('Admin/Health/Backup');
        })->name('health.backup');
    });
});

// Workflow API Routes
Route::prefix('api')->middleware(['auth:sanctum'])->group(function () {
    Route::get('/my-approvals', [App\Http\Controllers\Api\ApprovalTaskController::class, 'myApprovals']);
    Route::post('/approval-tasks/{task}/approve', [App\Http\Controllers\Api\ApprovalTaskController::class, 'approve']);
    Route::post('/approval-tasks/{task}/reject', [App\Http\Controllers\Api\ApprovalTaskController::class, 'reject']);
    Route::post('/approval-tasks/{task}/delegate', [App\Http\Controllers\Api\ApprovalTaskController::class, 'delegate']);
    Route::get('/approval-tasks/users', [App\Http\Controllers\Api\ApprovalTaskController::class, 'users']);

    Route::get('/workflows', [App\Http\Controllers\Api\WorkflowController::class, 'index']);
    Route::post('/workflows/start', [App\Http\Controllers\Api\WorkflowController::class, 'start']);
    Route::get('/workflow-instances/{instance}', [App\Http\Controllers\Api\WorkflowController::class, 'show']);
    Route::post('/workflow-instances/{instance}/cancel', [App\Http\Controllers\Api\WorkflowController::class, 'cancel']);
});

// Workflow Management Pages
Route::middleware(['auth'])->prefix('workflows')->group(function () {
    Route::get('/management', [App\Http\Controllers\WorkflowManagementController::class, 'index'])->name('workflows.management');
    Route::get('/instances', [App\Http\Controllers\WorkflowInstanceController::class, 'index'])->name('workflows.instances');
    Route::post('/instances/bulk', [App\Http\Controllers\WorkflowInstanceController::class, 'bulkAction'])->name('workflows.instances.bulk');
    Route::get('/instances/{instance}', [App\Http\Controllers\WorkflowInstanceController::class, 'show'])->name('workflows.instances.show');
    Route::post('/instances/{instance}/cancel', [App\Http\Controllers\WorkflowInstanceController::class, 'cancel'])->name('workflows.instances.cancel');
    Route::get('/my-approvals', [App\Http\Controllers\WorkflowManagementController::class, 'myApprovals'])->name('workflows.my-approvals');

    // Workflow CRUD
    Route::get('/create', [App\Http\Controllers\WorkflowController::class, 'create'])->name('workflows.create');
    Route::post('/', [App\Http\Controllers\WorkflowController::class, 'store'])->name('workflows.store');
    Route::get('/{workflow}/edit', [App\Http\Controllers\WorkflowController::class, 'edit'])->name('workflows.edit');
    Route::put('/{workflow}', [App\Http\Controllers\WorkflowController::class, 'update'])->name('workflows.update');
    Route::delete('/{workflow}', [App\Http\Controllers\WorkflowController::class, 'destroy'])->name('workflows.destroy');
});

Route::middleware(['auth', 'verified'])->prefix('sales')->name('sales.')->group(function () {
    Route::resource('invoices', \App\Http\Controllers\Sales\CustomerInvoiceController::class);
    Route::post('invoices/{invoice}/post', [\App\Http\Controllers\Sales\CustomerInvoiceController::class, 'post'])->name('invoices.post');
    Route::resource('payments', \App\Http\Controllers\Sales\CustomerPaymentController::class);
});

require __DIR__.'/settings.php';
