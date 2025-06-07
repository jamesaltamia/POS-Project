<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Get daily sales data.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function dailySales(Request $request)
    {
        // Placeholder data - replace with actual logic later
        $dailySales = [
            'amount' => 1234.56,
            'currency' => 'USD',
            'date' => now()->toDateString(),
            'trend' => '+5%', // Example trend vs yesterday
        ];

        return response()->json($dailySales);
    }

    /**
     * Get daily profit data.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function dailyProfit(Request $request)
    {
        // Placeholder data - replace with actual logic later
        $dailyProfit = [
            'amount' => 345.67,
            'currency' => 'USD',
            'date' => now()->toDateString(),
            'trend' => '+2%', // Example trend vs yesterday
        ];

        return response()->json($dailyProfit);
    }
}
