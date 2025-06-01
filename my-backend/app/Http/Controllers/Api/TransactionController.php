<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Mail\TransactionReceiptMail;
use Illuminate\Support\Facades\Mail;
use App\Models\Product;
use App\Events\LowStockAlert;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class TransactionController extends Controller
{
    // List all transactions
    public function index(Request $request)
    {
        $transactions = Transaction::with('items.product')
            ->when($request->date_from, fn($q) => $q->whereDate('created_at', '>=', $request->date_from))
            ->when($request->date_to, fn($q) => $q->whereDate('created_at', '<=', $request->date_to))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json($transactions);
    }

    // Store a new transaction (sale)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'payment_method' => 'required|in:cash,card',
            'payment_amount' => 'required|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1'
        ]);

        try {
            return DB::transaction(function () use ($request, $validated) {
                // Create transaction
                $transaction = Transaction::create([
                    'customer_name' => $validated['customer_name'],
                    'customer_email' => $validated['customer_email'],
                    'customer_phone' => $validated['customer_phone'] ?? null,
                    'payment_method' => $validated['payment_method'],
                    'payment_amount' => $validated['payment_amount'],
                    'status' => Transaction::STATUS_PENDING,
                    'user_id' => $request->user()->id
                ]);

                // Add items and update stock
                foreach ($validated['items'] as $index => $item) {
                    $product = Product::findOrFail($item['product_id']);

                    if ($product->stock < $item['quantity']) {
                        throw ValidationException::withMessages([
                            "items.{$index}.quantity" => ["Insufficient stock. Only {$product->stock} available."]
                        ]);
                    }

                    $transaction->items()->create([
                        'product_id' => $product->id,
                        'quantity' => $item['quantity'],
                        'price' => $product->price,
                        'subtotal' => $product->price * $item['quantity']
                    ]);

                    $product->stock -= $item['quantity'];
                    $product->save();
                }

                // Calculate totals
                $transaction->calculateTotals();
                $transaction->status = Transaction::STATUS_COMPLETED;
                $transaction->save();

                return response()->json($transaction->load('items.product'), 201);
            });
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to process transaction'], 500);
        }
    }

    public function salesReport(Request $request)
    {
        $request->validate([
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from'
        ]);

        $sales = Transaction::where('status', Transaction::STATUS_COMPLETED)
            ->whereDate('created_at', '>=', $request->date_from)
            ->whereDate('created_at', '<=', $request->date_to)
            ->get()
            ->groupBy(function ($transaction) {
                return Carbon::parse($transaction->created_at)->format('Y-m-d');
            })
            ->map(function ($transactions) {
                return [
                    'count' => $transactions->count(),
                    'total_sales' => $transactions->sum('total'),
                    'total_tax' => $transactions->sum('tax')
                ];
            });

        return response()->json([
            'data' => $sales,
            'summary' => [
                'total_transactions' => $sales->sum('count'),
                'total_sales' => $sales->sum('total_sales'),
                'total_tax' => $sales->sum('total_tax')
            ]
        ]);
    }

    // Show a single transaction
    public function show(Transaction $transaction)
    {
        return response()->json($transaction->load('items.product'));
    }

    public function cancel(Transaction $transaction)
    {
        if ($transaction->status === Transaction::STATUS_CANCELLED) {
            return response()->json(['message' => 'Transaction is already cancelled'], 422);
        }

        if ($transaction->status !== Transaction::STATUS_PENDING && $transaction->status !== Transaction::STATUS_COMPLETED) {
            return response()->json(['message' => 'Only pending or completed transactions can be cancelled'], 422);
        }

        DB::transaction(function () use ($transaction) {
            // Restore stock
            foreach ($transaction->items as $item) {
                $item->product->increment('stock', $item->quantity);
            }

            $transaction->status = Transaction::STATUS_CANCELLED;
            $transaction->save();
        });

        return response()->json($transaction);
    }

    public function receipt(Transaction $transaction)
    {
        $receipt = [
            'transaction_id' => $transaction->id,
            'date' => $transaction->created_at->format('Y-m-d H:i:s'),
            'customer' => [
                'name' => $transaction->customer_name,
                'email' => $transaction->customer_email,
                'phone' => $transaction->customer_phone
            ],
            'items' => $transaction->items->map(function ($item) {
                return [
                    'name' => $item->product->name,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                    'subtotal' => $item->subtotal
                ];
            }),
            'subtotal' => $transaction->subtotal,
            'tax' => $transaction->tax,
            'total' => $transaction->total,
            'payment' => [
                'method' => $transaction->payment_method,
                'amount' => $transaction->payment_amount,
                'change' => $transaction->change_amount
            ],
            'cashier' => $transaction->user->name
        ];

        return response()->json($receipt);
    }
}
