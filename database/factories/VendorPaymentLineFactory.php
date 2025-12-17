<?php

namespace Database\Factories;

use App\Models\VendorBill;
use App\Models\VendorPayment;
use App\Models\VendorPaymentLine;
use Illuminate\Database\Eloquent\Factories\Factory;

class VendorPaymentLineFactory extends Factory
{
    protected $model = VendorPaymentLine::class;

    public function definition(): array
    {
        return [
            'vendor_payment_id' => VendorPayment::factory(),
            'vendor_bill_id' => VendorBill::factory(),
            'amount' => $this->faker->randomFloat(2, 100, 1000),
        ];
    }
}
