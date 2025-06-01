<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\FeedbackController;
use App\Http\Controllers\Api\FarewellMessageController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\AuthController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // User profile
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Admin routes
    Route::middleware('role:administrator')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::post('roles/{role}/permissions', [UserController::class, 'updateRolePermissions']);
    });

    // Manager routes
    Route::middleware('role:administrator,manager')->group(function () {
        Route::apiResource('products', ProductController::class);
        Route::apiResource('inventories', InventoryController::class);
        Route::post('inventories/{inventory}/restock', [InventoryController::class, 'restock']);
        Route::get('reports/sales', [TransactionController::class, 'salesReport']);
        Route::get('reports/inventory', [InventoryController::class, 'inventoryReport']);
        Route::get('reports/feedback', [FeedbackController::class, 'feedbackReport']);
        Route::apiResource('farewell-messages', FarewellMessageController::class);
    });

    // Cashier routes
    Route::middleware('role:administrator,manager,cashier')->group(function () {
        Route::get('products', [ProductController::class, 'index']);
        Route::apiResource('transactions', TransactionController::class)->except(['update', 'destroy']);
        Route::post('transactions/{transaction}/cancel', [TransactionController::class, 'cancel']);
        Route::get('transactions/{transaction}/receipt', [TransactionController::class, 'receipt']);
        Route::apiResource('feedback', FeedbackController::class)->only(['store']);
        Route::get('farewell-message/random', [FarewellMessageController::class, 'random']);
        Route::get('inventories/{inventory}', [InventoryController::class, 'show']);
    });

    // Products
    Route::apiResource('products', ProductController::class);
    Route::post('/products/{product}/adjust-stock', [ProductController::class, 'adjustStock']);

    // Transactions
    Route::apiResource('transactions', TransactionController::class);
    Route::post('/transactions/{transaction}/cancel', [TransactionController::class, 'cancel']);
    Route::get('/transactions/{transaction}/receipt', [TransactionController::class, 'receipt']);

    // Feedback routes
    Route::post('feedback', [FeedbackController::class, 'store']);
    Route::get('reports/feedback', [FeedbackController::class, 'feedbackReport'])
        ->middleware('role:administrator,manager');

    // Farewell message routes
    Route::get('farewell-messages/random', [FarewellMessageController::class, 'random']);
    Route::get('farewell-messages/occasions', [FarewellMessageController::class, 'occasions']);
    Route::get('farewell-messages/languages', [FarewellMessageController::class, 'languages']);
});

require __DIR__ . '/auth.php';
