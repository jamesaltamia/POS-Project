<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Product;
use App\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;

class TransactionSystemTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create test products
        Product::create([
            'name' => 'Test Product 1',
            'sku' => 'TP001',
            'description' => 'Test product 1 description',
            'price' => 10.00,
            'unit' => 'piece',
            'stock' => 100,
            'low_stock_threshold' => 10,
            'reorder_point' => 20
        ]);

        Product::create([
            'name' => 'Test Product 2',
            'sku' => 'TP002',
            'description' => 'Test product 2 description',
            'price' => 12.00,
            'unit' => 'piece',
            'stock' => 100,
            'low_stock_threshold' => 10,
            'reorder_point' => 20
        ]);
    }

    public function test_complete_transaction_flow(): void
    {
        $response = $this->actingAs($this->cashier)
            ->postJson('/api/transactions', [
                'customer_name' => 'John Doe',
                'customer_email' => 'john@example.com',
                'customer_phone' => '1234567890',
                'items' => [
                    [
                        'product_id' => 1,
                        'quantity' => 2
                    ],
                    [
                        'product_id' => 2,
                        'quantity' => 2
                    ]
                ],
                'payment_method' => 'cash',
                'payment_amount' => 44.00
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'customer_name',
                'customer_email',
                'customer_phone',
                'subtotal',
                'tax',
                'total',
                'payment_method',
                'payment_amount',
                'change_amount',
                'status',
                'items' => [
                    '*' => [
                        'id',
                        'product_id',
                        'quantity',
                        'price',
                        'subtotal'
                    ]
                ]
            ]);

        // Verify stock was reduced
        $this->assertEquals(98, Product::find(1)->stock);
        $this->assertEquals(98, Product::find(2)->stock);

        // Verify calculations
        $transaction = Transaction::find($response->json('id'));
        $this->assertEquals(44.00, $transaction->subtotal); // (10 * 2) + (12 * 2)
        $this->assertEquals(4.40, $transaction->tax); // 10% tax
        $this->assertEquals(48.40, $transaction->total);
        $this->assertEquals(44.00, $transaction->payment_amount);
        $this->assertEquals(0.00, $transaction->change_amount);

        // Test transaction cancellation
        $response = $this->actingAs($this->cashier)
            ->postJson("/api/transactions/{$transaction->id}/cancel");

        $response->assertStatus(200);

        // Verify stock was restored
        $this->assertEquals(100, Product::find(1)->stock);
        $this->assertEquals(100, Product::find(2)->stock);
    }
}
