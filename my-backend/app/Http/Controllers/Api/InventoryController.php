<?php

namespace App\Http\Controllers\Api;

use App\Models\Inventory;
use App\Models\Product;
use App\Models\InventoryMovement;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    // List all inventory items
    public function index()
    {
        return response()->json(
            Inventory::with('product')
                ->withCount(['stockHistory as total_sales' => function ($query) {
                    $query->where('type', 'sale');
                }])
                ->get()
                ->map(function ($inventory) {
                    return array_merge($inventory->toArray(), [
                        'status' => $inventory->getStockStatus(),
                        'needs_reorder' => $inventory->needsReorder(),
                    ]);
                })
        );
    }

    // Store a new inventory record
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:0',
            'low_stock_threshold' => 'required|integer|min:0',
            'reorder_point' => 'required|integer|min:0',
        ]);

        $inventory = Inventory::create($validated);
        $inventory->checkLowStock();

        return response()->json($inventory->load('product'), 201);
    }

    // Show a single inventory record
    public function show(Inventory $inventory)
    {
        return response()->json(
            array_merge($inventory->load(['product', 'stockHistory'])->toArray(), [
                'status' => $inventory->getStockStatus(),
                'needs_reorder' => $inventory->needsReorder(),
            ])
        );
    }

    // Update inventory
    public function update(Request $request, Inventory $inventory)
    {
        $validated = $request->validate([
            'quantity' => 'sometimes|integer|min:0',
            'low_stock_threshold' => 'sometimes|integer|min:0',
            'reorder_point' => 'sometimes|integer|min:0',
        ]);

        if (isset($validated['quantity'])) {
            $change = $validated['quantity'] - $inventory->quantity;
            $inventory->adjustStock($change, 'adjustment', null, 'Manual adjustment');
        }

        $inventory->update($validated);
        $inventory->checkLowStock();

        return response()->json($inventory->load('product'));
    }

    // Delete inventory record
    public function destroy($id)
    {
        $inventory = Inventory::findOrFail($id);
        $inventory->delete();

        return response()->json(null, 204);
    }

    public function restock(Request $request, Inventory $inventory)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string',
        ]);

        $inventory->restock($validated['quantity'], $validated['notes'] ?? null);

        return response()->json($inventory->load('product'));
    }

    public function inventoryReport(Request $request)
    {
        $report = [
            'total_products' => Product::count(),
            'low_stock_items' => Inventory::whereRaw('quantity <= low_stock_threshold')->count(),
            'reorder_needed' => Inventory::whereRaw('quantity <= reorder_point')->count(),
            'total_value' => DB::raw('SUM(inventory.quantity * products.price) as total_value'),
            'stock_movement' => InventoryMovement::selectRaw('
                DATE(created_at) as date,
                SUM(CASE WHEN type = "sale" THEN quantity ELSE 0 END) as sales,
                SUM(CASE WHEN type = "restock" THEN quantity ELSE 0 END) as restocks
            ')
                ->groupBy('date')
                ->orderBy('date', 'desc')
                ->limit(30)
                ->get(),
        ];

        return response()->json($report);
    }
}
