@component('mail::message')
    # Low Stock Alert

    The following product has reached low stock levels:

    **Product Name:** {{ $product->name }}
    **SKU:** {{ $product->sku }}
    **Current Quantity:** {{ $inventory->quantity }}
    **Low Stock Threshold:** {{ $inventory->low_stock_threshold }}
    **Reorder Point:** {{ $inventory->reorder_point }}

    @component('mail::button', ['url' => config('app.url') . '/inventory/' . $inventory->id])
        View Inventory
    @endcomponent

    Please take necessary action to restock this item.

    Thanks,<br>
    {{ config('app.name') }}
@endcomponent
