<?php

namespace App\Domain\Purchasing\Actions\BlanketOrder;

use App\Models\BlanketOrder;

class DeleteBlanketOrder
{
    public function execute(BlanketOrder $blanketOrder): void
    {
        $blanketOrder->delete();
    }
}
