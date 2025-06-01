<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Product;
use App\Models\Inventory;
use App\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;

class TransactionTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    public $product;
    public $inventory;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a test product
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

        // Create inventory for the product
        $this->inventory = Inventory::create([
            'product_id' => $this->product->id,
            'quantity' => 100,
            'low_stock_threshold' => 20,
            'reorder_point' => 30
        ]);
    }

    public function test_can_create_transaction(): void
    {
        $response = $this->actingAs($this->cashier)
            ->postJson('/api/transactions', [
                'customer_name' => 'John Doe',
                'customer_email' => 'john@example.com',
                'customer_phone' => '1234567890',
                'items' => [
                    [
                        'product_id' => $this->product->id,
                        'quantity' => 2
                    ]
                ],
                'payment_method' => 'cash',
                'payment_amount' => 20.00
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

        $this->assertEquals(198, $this->product->fresh()->stock);
    }

    public function test_validates_customer_information(): void
    {
        $response = $this->actingAs($this->cashier)
            ->postJson('/api/transactions', [
                'items' => [
                    [
                        'product_id' => $this->product->id,
                        'quantity' => 2
                    ]
                ],
                'payment_method' => 'cash',
                'payment_amount' => 20.00
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['customer_name', 'customer_email']);
    }

    public function test_cannot_sell_more_than_stock(): void
    {
        $response = $this->actingAs($this->cashier)
            ->postJson('/api/transactions', [
                'customer_name' => 'John Doe',
                'customer_email' => 'john@example.com',
                'customer_phone' => '1234567890',
                'items' => [
                    [
                        'product_id' => $this->product->id,
                        'quantity' => 1000
                    ]
                ],
                'payment_method' => 'cash',
                'payment_amount' => 10000.00
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['items.0.quantity']);
    }

    public function test_can_cancel_transaction(): void
    {
        $transaction = Transaction::create([
            'customer_name' => 'John Doe',
            'customer_email' => 'john@example.com',
            'customer_phone' => '1234567890',
            'payment_method' => 'cash',
            'payment_amount' => 20.00,
            'status' => Transaction::STATUS_PENDING,
            'user_id' => $this->cashier->id
        ]);

        $transaction->items()->create([
            'product_id' => $this->product->id,
            'quantity' => 2,
            'price' => $this->product->price,
            'subtotal' => $this->product->price * 2
        ]);

        $transaction->calculateTotals();

        $this->product->decrement('stock', 2);

        $response = $this->actingAs($this->cashier)
            ->postJson("/api/transactions/{$transaction->id}/cancel");

        $response->assertStatus(200)
            ->assertJson([
                'id' => $transaction->id,
                'status' => Transaction::STATUS_CANCELLED
            ]);

        $this->assertEquals(200, $this->product->fresh()->stock);
    }

    public function test_can_generate_receipt(): void
    {
        $transaction = Transaction::create([
            'customer_name' => 'John Doe',
            'customer_email' => 'john@example.com',
            'customer_phone' => '1234567890',
            'payment_method' => 'cash',
            'payment_amount' => 20.00,
            'status' => Transaction::STATUS_COMPLETED,
            'user_id' => $this->cashier->id
        ]);

        $transaction->items()->create([
            'product_id' => $this->product->id,
            'quantity' => 2,
            'price' => $this->product->price,
            'subtotal' => $this->product->price * 2
        ]);

        $transaction->calculateTotals();

        $response = $this->actingAs($this->cashier)
            ->getJson("/api/transactions/{$transaction->id}/receipt");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'transaction_id',
                'date',
                'customer' => [
                    'name',
                    'email',
                    'phone'
                ],
                'items' => [
                    '*' => [
                        'name',
                        'quantity',
                        'price',
                        'subtotal'
                    ]
                ],
                'subtotal',
                'tax',
                'total',
                'payment' => [
                    'method',
                    'amount',
                    'change'
                ],
                'cashier'
            ]);
    }
}
