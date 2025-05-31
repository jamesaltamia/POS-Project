<?php

namespace App\Http\Controllers\Api;

use App\Models\Inventory;
use App\Models\Product;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class InventoryController extends Controller
{
    // List all inventory items
    public function index()
    {
        $inventories = Inventory::with('product')->get()->map(function ($inventory) {
            $data = $inventory->toArray();
            $data['low_stock'] = $inventory->isLowStock();
            return $data;
        });

        return response()->json($inventories);
    }

    // Store a new inventory record
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer',
            'low_stock_threshold' => 'nullable|integer',
        ]);

        $inventory = Inventory::create($validated);

        return response()->json($inventory, 201);
    }

    // Show a single inventory record
    public function show($id)
    {
        $inventory = Inventory::with('product')->findOrFail($id);
        return response()->json($inventory);
    }

    // Update inventory
    public function update(Request $request, $id)
    {
        $inventory = Inventory::findOrFail($id);

        $validated = $request->validate([
            'quantity' => 'sometimes|required|integer',
            'low_stock_threshold' => 'nullable|integer',
        ]);

        $inventory->update($validated);

        return response()->json($inventory);
    }

    // Delete inventory record
    public function destroy($id)
    {
        $inventory = Inventory::findOrFail($id);
        $inventory->delete();

        return response()->json(null, 204);
    }

    public function inventoryReport()
    {
        // Get all inventory with product info and low stock flag
        $inventories = Inventory::with('product')->get()->map(function ($inventory) {
            return [
                'product_id' => $inventory->product_id,
                'product_name' => $inventory->product->name ?? null,
                'quantity' => $inventory->quantity,
                'low_stock_threshold' => $inventory->low_stock_threshold,
                'low_stock' => $inventory->isLowStock(),
            ];
        });

        // Count of low stock items
        $lowStockCount = $inventories->where('low_stock', true)->count();

        return response()->json([
            'inventories' => $inventories,
            'low_stock_count' => $lowStockCount,
        ]);
    }
}
