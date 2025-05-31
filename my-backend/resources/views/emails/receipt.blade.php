@component('mail::message')
    # Your Purchase Receipt from {{ config('app.name') }}

    Dear {{ $transaction->user->name ?? 'Customer' }},

    Thank you for your purchase! Here is a summary of your transaction:

    @component('mail::table')
        | Product | Qty | Price | Subtotal |
        | ------- | --- | ----- | -------- |
        @foreach ($transaction->items as $item)
            | {{ $item->product->name }} | {{ $item->quantity }} | ${{ number_format($item->price, 2) }} |
            ${{ number_format($item->subtotal, 2) }} |
        @endforeach
    @endcomponent

    **Total:** ${{ number_format($transaction->total, 2) }}
    **Discount:** ${{ number_format($transaction->discount, 2) }}
    **Final Total:** ${{ number_format($transaction->final_total, 2) }}

    Sincerely,
    The Team at {{ config('app.name') }}
@endcomponent
