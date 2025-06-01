<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Product;
use Illuminate\Foundation\Testing\WithFaker;

class ProductManagementTest extends TestCase
{
    use WithFaker;

    public $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->product = Product::create([
            'name' => 'Test Product',
            'sku' => 'TEST001',
            'description' => 'Test product description',
            'price' => 10.00,
            'unit' => 'piece',
            'stock' => 200,
            'low_stock_threshold' => 10,
            'reorder_point' => 20
        ]);
    }

    public function test_can_create_product_with_initial_stock(): void
    {
        $response = $this->actingAs($this->manager)->postJson('/api/products', [
            'name' => 'New Product',
            'sku' => 'NEW001',
            'description' => 'New product description',
            'price' => 15.00,
            'unit' => 'piece',
            'stock' => 100,
            'low_stock_threshold' => 10,
            'reorder_point' => 20
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'name',
                'sku',
                'description',
                'price',
                'unit',
                'stock',
                'low_stock_threshold',
                'reorder_point'
            ]);
    }

    public function test_can_adjust_stock(): void
    {
        $response = $this->actingAs($this->manager)->postJson("/api/products/{$this->product->id}/adjust-stock", [
            'quantity' => 50,
            'notes' => 'Stock received'
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'id',
                'stock',
                'movement' => [
                    'id',
                    'product_id',
                    'quantity',
                    'type',
                    'notes'
                ]
            ]);

        $this->assertEquals(250, $response->json('stock'));
    }

    public function test_cannot_delete_product_with_stock(): void
    {
        $response = $this->actingAs($this->manager)->deleteJson("/api/products/{$this->product->id}");

        $response->assertStatus(422)
            ->assertJsonFragment(['message' => 'Cannot delete product with existing stock']);
    }
}
