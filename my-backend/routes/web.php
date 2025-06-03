<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

Route::middleware('web')->group(function () {
    // Remove the login and logout routes from the web middleware group
});
