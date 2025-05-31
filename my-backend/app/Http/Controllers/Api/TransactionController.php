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

class TransactionController extends Controller
{
    // List all transactions
    public function index()
    {
        return response()->json(Transaction::with('items.product', 'user')->get());
    }

    // Store a new transaction (sale)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'payment_method' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            $total = 0;
            foreach ($validated['items'] as $item) {
                $total += $item['price'] * $item['quantity'];
            }
            $discount = $validated['discount'] ?? 0;
            $final_total = $total - $discount;

            $transaction = Transaction::create([
                'user_id' => Auth::id() ?? 1, // fallback for testing
                'total' => $total,
                'discount' => $discount,
                'final_total' => $final_total,
                'payment_method' => $validated['payment_method'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'subtotal' => $item['price'] * $item['quantity'],
                ]);

                // Decrease inventory
                $inventory = Inventory::where('product_id', $item['product_id'])->first();
                if ($inventory) {
                    $inventory->adjustStock(-$item['quantity']);
                }
            }
            Mail::to('jamesaltamia23@gmail.com')->send(new TransactionReceiptMail($transaction));


            return response()->json($transaction->load('items.product'), 201);
        });
    }

    public function salesReport(Request $request)
    {
        // Total sales and transaction count
        $totalSales = Transaction::sum('final_total');
        $transactionCount = Transaction::count();

        // Sales per day (last 30 days)
        $salesPerDay = Transaction::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(final_total) as total')
        )
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'total_sales' => $totalSales,
            'transaction_count' => $transactionCount,
            'sales_per_day' => $salesPerDay,
        ]);
    }

    // Show a single transaction
    public function show($id)
    {
        $transaction = Transaction::with('items.product', 'user')->findOrFail($id);
        return response()->json($transaction);
    }

    public function receipt($id)
    {
        $transaction = Transaction::with('items.product', 'user')->findOrFail($id);
        return view('receipt', compact('transaction'));
    }
}
