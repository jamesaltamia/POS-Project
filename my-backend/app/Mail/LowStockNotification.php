<?php

namespace App\Mail;

use App\Models\Inventory;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class LowStockNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $inventory;

    public function __construct(Inventory $inventory)
    {
        $this->inventory = $inventory;
    }

    public function build()
    {
        return $this->subject('Low Stock Alert')
            ->markdown('emails.low-stock', [
                'inventory' => $this->inventory,
                'product' => $this->inventory->product,
            ]);
    }
}
