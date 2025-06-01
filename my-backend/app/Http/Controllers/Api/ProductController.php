<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    // List all products
    public function index()
    {
        $products = Product::with('inventory')
            ->when(request('category'), fn($q) => $q->where('category', request('category')))
            ->when(request('search'), fn($q) => $q->where('name', 'like', '%' . request('search') . '%')
                ->orWhere('sku', 'like', '%' . request('search') . '%')
                ->orWhere('barcode', 'like', '%' . request('search') . '%'))
            ->paginate(request('per_page', 15));

        return response()->json($products);
    }

    // Store a new product
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:50|unique:products',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'unit' => 'required|string|max:20',
            'stock' => 'required|integer|min:0',
            'low_stock_threshold' => 'required|integer|min:0',
            'reorder_point' => 'required|integer|min:0'
        ]);

        $product = Product::create($validated);

        return response()->json($product, 201);
    }

    // Show a single product
    public function show(Product $product)
    {
        return response()->json($product->load('inventory', 'movements'));
    }

    // Update a product
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => ['required', 'string', Rule::unique('products')->ignore($product->id)],
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'category' => 'nullable|string|max:255',
            'barcode' => ['nullable', 'string', Rule::unique('products')->ignore($product->id)],
            'unit' => 'required|string|max:50',
            'is_active' => 'boolean'
        ]);

        $product->update($validated);

        return response()->json($product->fresh('inventory'));
    }

    // Delete a product
    public function destroy(Product $product)
    {
        if ($product->stock > 0) {
            return response()->json([
                'message' => 'Cannot delete product with existing stock'
            ], 422);
        }

        $product->delete();
        return response()->noContent();
    }

    public function adjustStock(Request $request, Product $product)
    {
        $request->validate([
            'quantity' => 'required|integer|not_in:0',
            'notes' => 'required|string|max:255'
        ]);

        $newStock = $product->stock + $request->quantity;
        if ($newStock < 0) {
            return response()->json([
                'message' => 'Insufficient stock'
            ], 422);
        }

        DB::transaction(function () use ($product, $request) {
            $product->stock = $product->stock + $request->quantity;
            $product->save();

            $product->inventoryMovements()->create([
                'user_id' => $request->user()->id,
                'quantity' => $request->quantity,
                'type' => $request->quantity > 0 ? 'in' : 'out',
                'notes' => $request->notes
            ]);
        });

        return response()->json([
            'id' => $product->id,
            'stock' => $product->stock,
            'movement' => [
                'id' => $product->inventoryMovements()->latest()->first()->id,
                'product_id' => $product->id,
                'quantity' => $request->quantity,
                'type' => $request->quantity > 0 ? 'in' : 'out',
                'notes' => $request->notes
            ]
        ]);
    }
}
