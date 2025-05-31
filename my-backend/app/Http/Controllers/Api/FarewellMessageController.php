<?php

namespace App\Http\Controllers\Api;

use App\Models\FarewellMessage;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class FarewellMessageController extends Controller
{
    // List all messages
    public function index()
    {
        return response()->json(FarewellMessage::all());
    }

    // Store a new message
    public function store(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:255',
            'active' => 'boolean',
        ]);

        $message = FarewellMessage::create($validated);

        return response()->json($message, 201);
    }

    // Update a message
    public function update(Request $request, $id)
    {
        $message = FarewellMessage::findOrFail($id);

        $validated = $request->validate([
            'message' => 'sometimes|required|string|max:255',
            'active' => 'boolean',
        ]);

        $message->update($validated);

        return response()->json($message);
    }

    // Delete a message
    public function destroy($id)
    {
        $message = FarewellMessage::findOrFail($id);
        $message->delete();

        return response()->json(null, 204);
    }

    // Get a random active message
    public function random()
    {
        $message = FarewellMessage::where('active', true)->inRandomOrder()->first();
        return response()->json($message);
    }
}
