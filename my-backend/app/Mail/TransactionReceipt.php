<?php

namespace App\Mail;

use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TransactionReceipt extends Mailable
{
    use Queueable, SerializesModels;

    public $transaction;

    public function __construct(Transaction $transaction)
    {
        $this->transaction = $transaction;
    }

    public function build()
    {
        return $this->subject('Your Purchase Receipt from ' . config('app.name'))
            ->markdown('emails.transaction-receipt', [
                'transaction' => $this->transaction->load('items.product', 'user'),
                'company' => [
                    'name' => config('app.name'),
                    'address' => config('app.address'),
                    'phone' => config('app.phone'),
                    'email' => config('app.email')
                ]
            ]);
    }
}
