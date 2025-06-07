<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\ProductController;
use Illuminate\Http\Request;
use App\Http\Controllers\InventoryLogController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\FeedbackController;
use App\Http\Controllers\Api\FarewellMessageController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;

// Public test and login endpoints
Route::post('/test', function () {
    return response()->json(['success' => true]);
});
Route::post('/login', [AuthController::class, 'login']);

// Public inventory log endpoints (if these should be protected, move inside sanctum group)
Route::get('inventory-logs', [InventoryLogController::class, 'index']);
Route::post('inventory-logs', [InventoryLogController::class, 'store']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Admin-only routes
    Route::middleware([\App\Http\Middleware\RoleAccess::class . ':administrator,admin'])->group(function () {
        Route::apiResource('users', UserController::class);
        Route::post('roles/{role}/permissions', [UserController::class, 'updateRolePermissions']);
    });

    // Manager and above
    Route::middleware([\App\Http\Middleware\RoleAccess::class . ':administrator,manager'])->group(function () {
        Route::apiResource('products', ProductController::class);
        Route::apiResource('inventories', InventoryController::class);
        Route::post('inventories/{inventory}/restock', [InventoryController::class, 'restock']);
        Route::get('reports/sales', [TransactionController::class, 'salesReport']);
        Route::get('reports/inventory', [InventoryController::class, 'inventoryReport']);
        Route::get('reports/feedback', [FeedbackController::class, 'feedbackReport']);
        Route::apiResource('farewell-messages', FarewellMessageController::class);

        // Dashboard routes for Manager and Admin
        Route::get('dashboard/daily-sales', [DashboardController::class, 'dailySales']);
        Route::get('dashboard/daily-profit', [DashboardController::class, 'dailyProfit']);

        // Categories route for Manager and Admin
        Route::get('categories', [ProductController::class, 'getCategories']);
    });

    // Cashier and above
    Route::middleware([\App\Http\Middleware\RoleAccess::class . ':administrator,manager,cashier'])->group(function () {
        Route::get('products', [ProductController::class, 'index']); // Only index for cashiers
        Route::apiResource('transactions', TransactionController::class)->except(['update', 'destroy']);
        Route::post('transactions/{transaction}/cancel', [TransactionController::class, 'cancel']);
        Route::get('transactions/{transaction}/receipt', [TransactionController::class, 'receipt']);
        Route::post('feedback', [FeedbackController::class, 'store']);
        Route::get('farewell-messages/random', [FarewellMessageController::class, 'random']);
        Route::get('inventories/{inventory}', [InventoryController::class, 'show']);
    });

    // Feedback routes (for all authenticated users)
    Route::post('/feedback', [FeedbackController::class, 'store']);
    Route::get('/feedback', [FeedbackController::class, 'index']);

    // Farewell message routes
    Route::get('farewell-messages/random', [FarewellMessageController::class, 'random']);
    Route::get('farewell-messages/occasions', [FarewellMessageController::class, 'occasions']);
    Route::get('farewell-messages/languages', [FarewellMessageController::class, 'languages']);

    // Add fallback routes for main resources for all authenticated users
    Route::get('products', [ProductController::class, 'index']);
    Route::get('transactions', [TransactionController::class, 'index']);
    Route::get('feedback', [FeedbackController::class, 'index']);
    Route::get('farewell-messages', [FarewellMessageController::class, 'index']);
});

Route::middleware('checkrole:admin')->get('/test-role', function () {
    return response()->json(['success' => true]);
});

require __DIR__ . '/auth.php';
