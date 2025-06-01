<?php

namespace App\Providers;

use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use App\Events\LowStockAlert;
use App\Listeners\HandleLowStockAlert;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],
        LowStockAlert::class => [
            HandleLowStockAlert::class,
        ],
    ];

    public function boot()
    {
        //
    }
}
