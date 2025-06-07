<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Support\Facades\Log; // Assuming Category model exists
use Illuminate\Http\Request;
use Illuminate\Support\Str; // For SKU generation if needed

class ProductController extends Controller
{
    public function index()
    {
        return response()->json(Product::with('category')->get());
    }

    public function show(Product $product)
    {
        return $product->load(['inventoryLogs']);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0', // Frontend sends stock_quantity
            'category_id' => 'required|exists:categories,id', // Assuming categories table and category_id from frontend
            'sku' => 'required|string|max:100|unique:products,sku',
            'barcode' => 'nullable|string|max:255|unique:products,barcode',
        ]);
        $productData = $validated;
        // Map frontend field names to backend model field names if different
        $productData['stock'] = $validated['stock_quantity'];
        // The 'category' field in Product model expects a name, but frontend sends category_id.
        // For now, let's assume 'category' in Product model should store category_id or be changed to category_id.
        // If Product model's 'category' field is meant to store the category *name*,
        // you'd fetch the category name here: $category = Category::find($validated['category_id']); $productData['category'] = $category->name;
        // For simplicity now, let's assume Product model's 'category' field can store the ID or is named 'category_id'.
        // If your Product model has 'category_id' in $fillable instead of 'category', this is simpler.
        // Let's assume Product model has 'category_id' in $fillable for now, or 'category' can take an ID.
        // If not, Product model's $fillable needs 'category_id' and 'category' might be removed or handled differently.
        $productData['category_id'] = $validated['category_id']; // Ensure Product model can handle this

        // If SKU is not provided or needs to be auto-generated, you can do it here:
        // if (empty($productData['sku'])) {
        //     $productData['sku'] = Str::upper(Str::random(8)); // Example SKU generation
        // }

        unset($productData['stock_quantity']); // Remove original frontend field if it's not in $fillable

        Log::info('ProductData before create: ', $productData);
        $product = Product::create($productData);
        Log::info('Product object after create: ', $product->toArray());
        return response()->json($product, 201);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'barcode' => 'nullable|string|max:255|unique:products,barcode,' . $product->id,
            // add other product fields as needed
        ]);
        $product->update($validated);
        return $product->load(['inventoryLogs']);
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json(null, 204);
    }

    public function getCategories()
    {
        // Assuming you have a Category model and a categories table
        $categories = Category::all(); 
        return response()->json($categories);
    }
}
