<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FeedbackController extends Controller
{
    // Store feedback
    public function store(Request $request)
    {
        $validated = $request->validate([
            'transaction_id' => 'required|exists:transactions,id',
            'customer_name' => 'nullable|string|max:255',
            'customer_email' => 'nullable|email|max:255',
            'rating' => 'required|integer|min:1|max:5',
            'service_quality_rating' => 'required|integer|min:1|max:5',
            'product_quality_rating' => 'required|integer|min:1|max:5',
            'cleanliness_rating' => 'required|integer|min:1|max:5',
            'staff_friendliness_rating' => 'required|integer|min:1|max:5',
            'would_recommend' => 'required|boolean',
            'areas_of_improvement' => 'nullable|array',
            'areas_of_improvement.*' => 'required|in:' . implode(',', Feedback::getImprovementAreas()),
            'comment' => 'nullable|string|max:1000',
            'is_anonymous' => 'boolean'
        ]);

        $transaction = Transaction::findOrFail($validated['transaction_id']);

        // Only allow feedback for completed transactions
        if ($transaction->status !== Transaction::STATUS_COMPLETED) {
            return response()->json([
                'message' => 'Feedback can only be submitted for completed transactions'
            ], 422);
        }

        // Check if feedback already exists
        if ($transaction->feedback()->exists()) {
            return response()->json([
                'message' => 'Feedback has already been submitted for this transaction'
            ], 422);
        }

        $feedback = $transaction->feedback()->create($validated);

        return response()->json($feedback, 201);
    }

    public function feedbackReport(Request $request)
    {
        $query = Feedback::query();

        // Apply date range filter if provided
        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        // Overall statistics
        $overallStats = [
            'total_feedback' => $query->count(),
            'average_rating' => round($query->avg('rating'), 1),
            'recommendation_rate' => round($query->where('would_recommend', true)->count() / max($query->count(), 1) * 100, 1)
        ];

        // Rating distribution
        $ratingDistribution = $query->select('rating', DB::raw('count(*) as count'))
            ->groupBy('rating')
            ->pluck('count', 'rating')
            ->toArray();

        // Category averages
        $categoryAverages = [
            'service_quality' => round($query->avg('service_quality_rating'), 1),
            'product_quality' => round($query->avg('product_quality_rating'), 1),
            'cleanliness' => round($query->avg('cleanliness_rating'), 1),
            'staff_friendliness' => round($query->avg('staff_friendliness_rating'), 1)
        ];

        // Areas of improvement analysis
        $improvementAreas = [];
        $feedbackWithAreas = $query->whereNotNull('areas_of_improvement')->get();
        foreach ($feedbackWithAreas as $feedback) {
            foreach ($feedback->areas_of_improvement as $area) {
                $improvementAreas[$area] = ($improvementAreas[$area] ?? 0) + 1;
            }
        }
        arsort($improvementAreas);

        // Recent comments
        $recentComments = $query->whereNotNull('comment')
            ->latest()
            ->take(10)
            ->get(['id', 'rating', 'comment', 'created_at'])
            ->map(function ($feedback) {
                return [
                    'rating' => $feedback->rating,
                    'comment' => $feedback->comment,
                    'date' => $feedback->created_at->format('Y-m-d H:i:s')
                ];
            });

        return response()->json([
            'overall_stats' => $overallStats,
            'rating_distribution' => $ratingDistribution,
            'category_averages' => $categoryAverages,
            'improvement_areas' => $improvementAreas,
            'recent_comments' => $recentComments
        ]);
    }

    // List all feedback (optional, for admin/reporting)
    public function index()
    {
        return response()->json(Feedback::with('transaction')->get());
    }
}
