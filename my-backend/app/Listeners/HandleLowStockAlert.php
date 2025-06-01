<?php

namespace App\Listeners;

use App\Events\LowStockAlert;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\LowStockNotification;
use App\Models\User;

class HandleLowStockAlert
{
    public function handle(LowStockAlert $event)
    {
        $inventory = $event->inventory;
        $product = $inventory->product;

        // Get all managers and administrators
        $users = User::whereHas('role', function ($query) {
            $query->whereIn('name', ['administrator', 'manager']);
        })->get();

        // Send email notifications
        foreach ($users as $user) {
            Mail::to($user->email)->queue(new LowStockNotification($inventory));
        }

        // Log the alert
        Log::warning("Low stock alert for product {$product->name} (ID: {$product->id}). Current quantity: {$inventory->quantity}");
    }
}
