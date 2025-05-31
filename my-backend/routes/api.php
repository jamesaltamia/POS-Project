<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\FeedbackController;
use App\Http\Controllers\Api\FarewellMessageController;

// Authenticated user route
Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// Resource routes
Route::apiResource('products', ProductController::class);
Route::apiResource('inventories', InventoryController::class);
Route::apiResource('transactions', TransactionController::class);
Route::apiResource('feedback', FeedbackController::class)->only(['index', 'store']);
Route::apiResource('farewell-messages', FarewellMessageController::class);

// Custom/report routes
Route::get('farewell-message/random', [FarewellMessageController::class, 'random']);
Route::get('reports/sales', [TransactionController::class, 'salesReport']);
Route::get('reports/inventory', [InventoryController::class, 'inventoryReport']);
Route::get('reports/feedback', [FeedbackController::class, 'feedbackReport']);


require __DIR__ . '/auth.php';
