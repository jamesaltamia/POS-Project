<?php

namespace App\Http\Controllers\Api;

use App\Models\Feedback;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class FeedbackController extends Controller
{
    // Store feedback
    public function store(Request $request)
    {
        $validated = $request->validate([
            'transaction_id' => 'required|exists:transactions,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:255',
        ]);

        $feedback = Feedback::create($validated);

        return response()->json($feedback, 201);
    }

    public function feedbackReport()
    {
        $totalFeedback = \App\Models\Feedback::count();
        $averageRating = round(\App\Models\Feedback::avg('rating'), 2);

        // Distribution of ratings (1-5)
        $distribution = \App\Models\Feedback::selectRaw('rating, COUNT(*) as count')
            ->groupBy('rating')
            ->orderBy('rating')
            ->pluck('count', 'rating');

        return response()->json([
            'total_feedback' => $totalFeedback,
            'average_rating' => $averageRating,
            'distribution' => $distribution,
        ]);
    }

    // List all feedback (optional, for admin/reporting)
    public function index()
    {
        return response()->json(Feedback::with('transaction')->get());
    }
}
