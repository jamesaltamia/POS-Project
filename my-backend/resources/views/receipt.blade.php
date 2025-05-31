<!DOCTYPE html>
<html>

<head>
    <title>Receipt #{{ $transaction->id }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
        }

        .items td,
        .items th {
            padding: 4px 8px;
        }
    </style>
</head>

<body>
    <h2>Receipt #{{ $transaction->id }}</h2>
    <p>Date: {{ $transaction->created_at }}</p>
    <p>Cashier: {{ $transaction->user->name ?? 'N/A' }}</p>
    <table class="items" border="1" cellspacing="0">
        <thead>
            <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($transaction->items as $item)
                <tr>
                    <td>{{ $item->product->name }}</td>
                    <td>{{ $item->quantity }}</td>
                    <td>{{ number_format($item->price, 2) }}</td>
                    <td>{{ number_format($item->subtotal, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
    <p>Total: <b>${{ number_format($transaction->total, 2) }}</b></p>
    <p>Discount: <b>${{ number_format($transaction->discount, 2) }}</b></p>
    <p>Final Total: <b>${{ number_format($transaction->final_total, 2) }}</b></p>
</body>

</html>
