<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BookingRequest;
use App\Models\Review;
use Carbon\Carbon;

class TherapistStatsController extends Controller
{
    public function index(Request $request)
    {
        $user      = $request->user();
        $therapist = $user->therapist;

        if (!$therapist) {
            return response()->json(['message' => 'Therapist profile not found.'], 403);
        }

        $now           = Carbon::now();
        $startOfMonth  = $now->copy()->startOfMonth();
        $endOfMonth    = $now->copy()->endOfMonth();

        // ── Sessions this month (paid requests whose slot falls in current month) ──
        $sessionsThisMonth = BookingRequest::where('therapist_id', $therapist->id)
            ->where('status', 'paid')
            ->whereHas('schedule', function ($q) use ($startOfMonth, $endOfMonth) {
                $q->whereBetween('session_date', [$startOfMonth, $endOfMonth]);
            })
            ->count();

        // ── Active patients (unique clients with at least one paid request) ──
        $activePatients = BookingRequest::where('therapist_id', $therapist->id)
            ->where('status', 'paid')
            ->distinct('client_id')
            ->count('client_id');

        // ── Revenue this month (sum of payments linked to this therapist's slots) ──
        $revenueThisMonth = \App\Models\Payment::whereHas('schedule', function ($q) use ($therapist, $startOfMonth, $endOfMonth) {
                $q->where('therapist_id', $therapist->id)
                  ->whereBetween('session_date', [$startOfMonth, $endOfMonth]);
            })
            ->where('status', 'paid')
            ->sum('amount');

        // ── Average rating ──
        $avgRating = Review::where('therapist_id', $therapist->id)->avg('rating');

        return response()->json([
            'sessions_this_month'  => $sessionsThisMonth,
            'active_patients'      => $activePatients,
            'revenue_this_month'   => round((float) $revenueThisMonth, 2),
            'avg_rating'           => $avgRating ? round($avgRating, 1) : null,
        ]);
    }
}
