<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Therapist;
use App\Models\Schedule;
use Carbon\Carbon;

class TherapistController extends Controller
{
    /**
     * Public listing — only therapists with at least one future available slot.
     */
    public function index()
    {
        $therapists = Therapist::whereHas('schedules', function ($q) {
                $q->where('status', 'available')
                  ->where('session_date', '>=', Carbon::now());
            })
            ->with(['user', 'schedules' => function ($q) {
                $q->where('status', 'available')
                  ->where('session_date', '>=', Carbon::now())
                  ->orderBy('session_date')
                  ->limit(5);
            }, 'services'])
            ->get()
            ->map(function ($therapist) {
                return [
                    'id'             => $therapist->id,
                    'name'           => $therapist->user->name,
                    'specialization' => $therapist->specialization,
                    'experience'     => $therapist->experience,
                    'location'       => $therapist->user->location,
                    'bio'            => $therapist->bio,
                    'approach'       => $therapist->approach,
                    'education'      => $therapist->education,
                    'languages'      => $therapist->languages,
                    'specialties'    => $therapist->specialties,
                    'services'       => $therapist->services,
                    'next_slots'     => $therapist->schedules->map(fn($s) => [
                        'id'           => $s->id,
                        'session_date' => $s->session_date,
                        'mode'         => $s->mode,
                        'service_ids'  => $s->service_ids,
                    ]),
                ];
            });

        return response()->json($therapists);
    }

    /**
     * Public profile for a single therapist (with their available slots).
     */
    public function show(string $id)
    {
        $therapist = Therapist::with(['user', 'services', 'schedules' => function ($q) {
                $q->where('status', 'available')
                  ->where('session_date', '>=', Carbon::now())
                  ->orderBy('session_date');
            }])
            ->findOrFail($id);

        return response()->json([
            'id'             => $therapist->id,
            'name'           => $therapist->user->name,
            'specialization' => $therapist->specialization,
            'experience'     => $therapist->experience,
            'location'       => $therapist->user->location,
            'bio'            => $therapist->bio,
            'approach'       => $therapist->approach,
            'education'      => $therapist->education,
            'languages'      => $therapist->languages,
            'specialties'    => $therapist->specialties,
            'services'       => $therapist->services,
            'available_slots' => $therapist->schedules->map(fn($s) => [
                'id'           => $s->id,
                'session_date' => $s->session_date,
                'mode'         => $s->mode,
                'service_ids'  => $s->service_ids,
            ]),
        ]);
    }

    /**
     * Update own therapist profile (auth required).
     */
    public function update(Request $request, string $id)
    {
        $therapist = Therapist::findOrFail($id);

        // Ensure the user owns this profile
        if ($therapist->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $data = $request->validate([
            'specialization' => 'sometimes|string|max:255',
            'experience'     => 'sometimes|integer|min:0',
            'bio'            => 'sometimes|nullable|string',
            'approach'       => 'sometimes|nullable|string',
            'education'      => 'sometimes|nullable|array',
            'languages'      => 'sometimes|nullable|array',
            'specialties'    => 'sometimes|nullable|array',
        ]);

        $therapist->update($data);

        return response()->json($therapist);
    }
}
