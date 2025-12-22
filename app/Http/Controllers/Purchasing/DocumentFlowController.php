<?php

namespace App\Http\Controllers\Purchasing;

use App\Domain\Purchasing\Services\DocumentFlowService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DocumentFlowController extends Controller
{
    public function __construct(
        protected DocumentFlowService $flowService
    ) {}

    public function show(string $type, int $id): JsonResponse
    {
        // Validate type
        $allowedTypes = ['pr', 'rfq', 'quote', 'po', 'gr', 'bill'];
        if (!in_array($type, $allowedTypes)) {
            return response()->json(['error' => 'Invalid document type'], 400);
        }

        $data = $this->flowService->getChain($type, $id);

        return response()->json($data);
    }
}
