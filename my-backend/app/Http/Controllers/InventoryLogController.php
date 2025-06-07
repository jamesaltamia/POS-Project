<?php

namespace App\Http\Controllers;

use App\Models\InventoryLog;
use Illuminate\Http\Request;

class InventoryLogController extends Controller
{
    public function index()
    {
        return response()->json(InventoryLog::with(['product', 'user'])->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'user_id' => 'required|exists:users,id',
            'change' => 'required|integer',
            'reason' => 'nullable|string|max:255',
        ]);
        $log = InventoryLog::create($validated);
        return response()->json($log->load(['product', 'user']), 201);
    }
}
