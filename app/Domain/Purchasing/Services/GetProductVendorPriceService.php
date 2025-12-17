<?php

namespace App\Domain\Purchasing\Services;

use App\Models\Product;
use App\Models\VendorPricelist;

class GetProductVendorPriceService
{
    public function execute(Product $product, int $vendorId, float $quantity = 1): float
    {
        // 1. Try to find a specific vendor price for the quantity tier
        $pricelist = VendorPricelist::query()
            ->where('vendor_id', $vendorId)
            ->where('product_id', $product->id)
            ->where('min_quantity', '<=', $quantity)
            ->orderBy('min_quantity', 'desc') // Get the highest qualifying tier (e.g. qty 100 > qty 1)
            ->first();

        if ($pricelist) {
            return $pricelist->price;
        }

        // 2. Fallback to Product's standard cost
        return $product->cost;
    }
}
