<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\BookingRequest;
use App\Models\Schedule;
use Illuminate\Support\Facades\DB;

class BookingRequestController extends Controller
{
    /**
     * Display a listing of requests based on user role.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'patient') {
            $client = $user->client;
            if (!$client) {
                return response()->json([], 200);
            }
            $requests = BookingRequest::with(['therapist.user', 'schedule'])
                ->where('client_id', $client->id)
                ->orderBy('created_at', 'desc')
                ->get();
            return response()->json($requests);
        } else if ($user->role === 'therapist') {
            $therapist = $user->therapist;
            if (!$therapist) {
                return response()->json([], 200);
            }
            $requests = BookingRequest::with(['client.user', 'schedule', 'service'])
                ->where('therapist_id', $therapist->id)
                ->orderBy('created_at', 'desc')
                ->get();
                
            $requests->transform(function ($request) use ($therapist) {
                if ($request->status === 'pending' && $request->service && $request->schedule) {
                    $durationMin = (int) filter_var($request->service->duration, FILTER_SANITIZE_NUMBER_INT);
                    if ($durationMin > 0) {
                        $startTime = \Carbon\Carbon::parse($request->schedule->session_date);
                        $endTime = $startTime->copy()->addMinutes($durationMin);
                        
                        $overlaps = Schedule::where('therapist_id', $therapist->id)
                            ->where('status', 'available')
                            ->where('id', '!=', $request->schedule_id)
                            ->where('session_date', '>', $startTime)
                            ->where('session_date', '<', $endTime)
                            ->get();
                            
                        if ($overlaps->isNotEmpty()) {
                            $request->overlapping_schedules = $overlaps;
                        }
                    }
                }
                return $request;
            });
            
            return response()->json($requests);
        }

        return response()->json([], 403);
    }

    /**
     * Display a single booking request (for payment page).
     */
    public function show(Request $request, string $id)
    {
        $user = $request->user();
        $bookingRequest = BookingRequest::with(['therapist.user', 'client.user', 'schedule', 'service'])
            ->findOrFail($id);

        // Ensure the user owns this request
        if ($user->role === 'patient' && $bookingRequest->client_id !== $user->client?->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }
        if ($user->role === 'therapist' && $bookingRequest->therapist_id !== $user->therapist?->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        return response()->json($bookingRequest);
    }

    /**
     * Store a newly created booking request from a patient.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'patient') {
            return response()->json(['message' => 'Seul un patient peut réserver.'], 403);
        }

        $client = $user->client;
        if (!$client) {
            return response()->json(['message' => 'Profil patient non trouvé.'], 404);
        }

        $data = $request->validate([
            'therapist_id' => 'required|exists:therapists,id',
            'service_id' => 'required|exists:services,id',
            'session_date' => 'required|date',
            'mode' => 'required|in:online,cabinet,both',
            'commentary' => 'nullable|string',
        ]);

        $sessionDate = \Carbon\Carbon::parse($data['session_date'])->format('Y-m-d H:i:s');

        // Find existing schedule or create one dynamically for the booking request
        $schedule = Schedule::firstOrCreate(
            [
                'therapist_id' => $data['therapist_id'],
                'session_date' => $sessionDate,
            ],
            [
                'status' => 'available',
                'mode' => $data['mode'],
                'category' => 'consultation',
            ]
        );

        if ($schedule->status !== 'available') {
            return response()->json(['message' => 'Ce créneau est déjà réservé par un autre patient.'], 422);
        }

        $bookingRequest = BookingRequest::create([
            'client_id' => $client->id,
            'therapist_id' => $data['therapist_id'],
            'service_id' => $data['service_id'],
            'schedule_id' => $schedule->id,
            'commentary' => $data['commentary'],
            'status' => 'pending',
        ]);

        return response()->json($bookingRequest, 201);
    }

    /**
     * Update the request status (Accept or Refuse by Therapist).
     */
    public function update(Request $request, string $id)
    {
        $user = $request->user();
        if ($user->role !== 'therapist') {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $therapist = $user->therapist;
        $bookingRequest = BookingRequest::findOrFail($id);

        if ($bookingRequest->therapist_id !== $therapist->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $data = $request->validate([
            'status' => 'required|in:accepted,refused',
        ]);

        DB::transaction(function () use ($bookingRequest, $data) {
            $bookingRequest->update(['status' => $data['status']]);
        });

        return response()->json($bookingRequest->load(['client.user', 'schedule']));
    }

    /**
     * Delete a booking request (patient cancels pending, or either party cleans up refused).
     */
    public function destroy(Request $request, string $id)
    {
        $user = $request->user();
        $bookingRequest = BookingRequest::findOrFail($id);

        if ($user->role === 'patient') {
            $client = $user->client;
            if (!$client || $bookingRequest->client_id !== $client->id) {
                return response()->json(['message' => 'Non autorisé.'], 403);
            }
            // Patients can delete any of their own requests (payment not yet implemented)
        } elseif ($user->role === 'therapist') {
            $therapist = $user->therapist;
            if (!$therapist || $bookingRequest->therapist_id !== $therapist->id) {
                return response()->json(['message' => 'Non autorisé.'], 403);
            }
            // Therapists can delete any request (pending, refused, accepted) until payment is implemented
        } else {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $bookingRequest->delete();

        return response()->json(['message' => 'Demande supprimée.']);
    }

    /**
     * Cancel a paid booking (patient or therapist) — forbidden within 48 h of session.
     */
    public function cancel(Request $request, string $id)
    {
        $user           = $request->user();
        $bookingRequest = BookingRequest::with('schedule')->findOrFail($id);

        // Authorization: only the owning patient or therapist
        if ($user->role === 'patient') {
            if (!$user->client || $bookingRequest->client_id !== $user->client->id) {
                return response()->json(['message' => 'Non autorisé.'], 403);
            }
        } elseif ($user->role === 'therapist') {
            if (!$user->therapist || $bookingRequest->therapist_id !== $user->therapist->id) {
                return response()->json(['message' => 'Non autorisé.'], 403);
            }
        } else {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        // Must be a paid request
        if ($bookingRequest->status !== 'paid') {
            return response()->json(['message' => 'Seules les séances payées peuvent être annulées.'], 422);
        }

        // 48-hour rule: cannot cancel within 48 h of the session
        if ($bookingRequest->schedule) {
            $sessionDate = \Carbon\Carbon::parse($bookingRequest->schedule->session_date);
            if ($sessionDate->diffInHours(now(), false) > -48) {
                return response()->json([
                    'message' => 'Impossible d\'annuler une séance dans les 48 h précédant la consultation.',
                ], 422);
            }
        }

        DB::transaction(function () use ($bookingRequest) {
            // Free the schedule slot
            if ($bookingRequest->schedule) {
                $bookingRequest->schedule->update(['status' => 'available']);
            }
            // Cancel the request
            $bookingRequest->update(['status' => 'cancelled']);
        });

        return response()->json(['message' => 'Séance annulée avec succès.']);
    }
}
