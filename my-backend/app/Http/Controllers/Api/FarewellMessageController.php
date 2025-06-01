<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FarewellMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class FarewellMessageController extends Controller
{
    // List all messages
    public function index(Request $request)
    {
        $messages = FarewellMessage::with('createdBy')
            ->when($request->language, fn($q) => $q->where('language', $request->language))
            ->when($request->occasion, fn($q) => $q->where('occasion', $request->occasion))
            ->when($request->is_active !== null, fn($q) => $q->where('is_active', $request->boolean('is_active')))
            ->orderBy('display_order')
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 15);

        return response()->json($messages);
    }

    // Store a new message
    public function store(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:1000',
            'language' => ['required', Rule::in(array_keys(FarewellMessage::getLanguages()))],
            'occasion' => ['required', Rule::in(FarewellMessage::getOccasions())],
            'is_active' => 'boolean',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'display_order' => 'integer|min:0'
        ]);

        $message = FarewellMessage::create([
            ...$validated,
            'created_by_user_id' => $request->user()->id
        ]);

        return response()->json($message->load('createdBy'), 201);
    }

    // Get a single message
    public function show(FarewellMessage $message)
    {
        return response()->json($message->load('createdBy'));
    }

    // Update a message
    public function update(Request $request, FarewellMessage $message)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:1000',
            'language' => ['required', Rule::in(array_keys(FarewellMessage::getLanguages()))],
            'occasion' => ['required', Rule::in(FarewellMessage::getOccasions())],
            'is_active' => 'boolean',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'display_order' => 'integer|min:0'
        ]);

        $message->update($validated);

        return response()->json($message->fresh('createdBy'));
    }

    // Delete a message
    public function destroy(FarewellMessage $message)
    {
        $message->delete();
        return response()->json(null, 204);
    }

    // Get a random active message
    public function random(Request $request)
    {
        $language = $request->get('language', 'en');
        $occasion = $request->get('occasion', FarewellMessage::getCurrentOccasion());

        $message = FarewellMessage::getRandomActive($language, $occasion);

        if (!$message) {
            // Fallback to general occasion if no specific occasion message found
            $message = FarewellMessage::getRandomActive($language, 'general');
        }

        if (!$message) {
            // Final fallback to English general message
            $message = FarewellMessage::getRandomActive('en', 'general');
        }

        if (!$message) {
            return response()->json(['message' => 'Thank you for your purchase!']);
        }

        return response()->json($message);
    }

    public function occasions()
    {
        return response()->json(FarewellMessage::getOccasions());
    }

    public function languages()
    {
        return response()->json(FarewellMessage::getLanguages());
    }

    public function bulkToggle(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:farewell_messages,id',
            'is_active' => 'required|boolean',
        ]);

        FarewellMessage::whereIn('id', $validated['ids'])
            ->update(['is_active' => $validated['is_active']]);

        return response()->json(['message' => 'Messages updated successfully']);
    }
}
