@component('mail::message')
    # Thank you for your purchase!

    Dear {{ $transaction->customer_name }},

    Here is your receipt for transaction #{{ $transaction->id }}:

    @component('mail::panel')
        # {{ $company['name'] }}
        {{ $company['address'] }}
        Tel: {{ $company['phone'] }}
        Email: {{ $company['email'] }}

        Transaction Date: {{ $transaction->created_at->format('Y-m-d H:i:s') }}
        Cashier: {{ $transaction->user->name }}
    @endcomponent

    @component('mail::table')
        | Product | Quantity | Unit Price | Discount | Subtotal |
        |:--------|:---------|:-----------|:---------|:---------|
        @foreach ($transaction->items as $item)
            | {{ $item->product->name }} | {{ number_format($item->quantity, 2) }} {{ $item->product->unit }} |
            ${{ number_format($item->unit_price, 2) }} | ${{ number_format($item->discount, 2) }} |
            ${{ number_format($item->subtotal, 2) }} |
        @endforeach
    @endcomponent

    @component('mail::panel')
        Subtotal: ${{ number_format($transaction->subtotal, 2) }}
        Tax: ${{ number_format($transaction->tax, 2) }}
        Discount: ${{ number_format($transaction->discount, 2) }}
        **Total: ${{ number_format($transaction->total, 2) }}**

        Payment Method: {{ ucfirst($transaction->payment_method) }}
        Payment Status: {{ ucfirst($transaction->payment_status) }}
    @endcomponent

    Thank you for shopping with us!

    Best regards,<br>
    {{ $company['name'] }}
@endcomponent
