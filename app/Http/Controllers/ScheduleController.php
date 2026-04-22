<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Schedule;
use Carbon\Carbon;

class ScheduleController extends Controller
{
    /**
     * Map day abbreviation to ISO weekday number (1=Monday ... 6=Saturday).
     */
    private const DAY_MAP = [
        'lun' => 1, 'mar' => 2, 'mer' => 3,
        'jeu' => 4, 'ven' => 5, 'sam' => 6,
    ];

    /**
     * Compute the real date for a given day abbreviation + week offset.
     * Week offset 0 = current week (Mon–Sat), 1 = next week, etc.
     */
    private function resolveDate(string $day, int $weekOffset, string $startTime): Carbon
    {
        $dayNum = self::DAY_MAP[$day] ?? 1;

        // Get Monday of current week
        $monday = Carbon::now()->startOfWeek(Carbon::MONDAY);

        // Move to the target week
        $monday->addWeeks($weekOffset);

        // Move to the target day (Monday = 0 offset, Tuesday = 1, etc.)
        $targetDate = $monday->copy()->addDays($dayNum - 1);

        // Set the time
        [$hours, $minutes] = explode(':', $startTime);
        $targetDate->setHour((int)$hours)->setMinute((int)$minutes)->setSecond(0);

        return $targetDate;
    }

    /**
     * List all available slots for the authenticated therapist.
     */
    public function index(Request $request)
    {
        $therapist = $request->user()->therapist;

        if (!$therapist) {
            return response()->json(['message' => 'Therapist profile not found.'], 403);
        }

        $schedules = Schedule::where('therapist_id', $therapist->id)
            ->where('session_date', '>=', Carbon::now()->startOfWeek())
            ->orderBy('session_date')
            ->get()
            ->map(function ($slot) {
                $date = Carbon::parse($slot->session_date);
                // Convert back to frontend format
                $dayMap = array_flip(self::DAY_MAP);
                $dayNum = (int)$date->dayOfWeekIso; // 1=Mon ... 6=Sat
                return [
                    'id'         => (string)$slot->id,
                    'day'        => $dayMap[$dayNum] ?? 'lun',
                    'startTime'  => $date->format('H:i'),
                    'mode'       => $slot->mode,
                    'serviceIds' => $slot->service_ids ?? [],
                    'status'     => $slot->status,
                    'weekOffset' => $this->computeWeekOffset($date),
                ];
            });

        return response()->json($schedules);
    }

    /**
     * Compute week offset relative to current week.
     */
    private function computeWeekOffset(Carbon $date): int
    {
        $currentMonday = Carbon::now()->startOfWeek(Carbon::MONDAY);
        $slotMonday    = $date->copy()->startOfWeek(Carbon::MONDAY);
        return (int)$currentMonday->diffInWeeks($slotMonday, false);
    }

    /**
     * Create a new availability slot.
     */
    public function store(Request $request)
    {
        $therapist = $request->user()->therapist;

        if (!$therapist) {
            return response()->json(['message' => 'Therapist profile not found.'], 403);
        }

        $data = $request->validate([
            'day'        => 'required|in:lun,mar,mer,jeu,ven,sam',
            'week_offset'=> 'required|integer|min:0',
            'start_time' => 'required|date_format:H:i',
            'mode'       => 'required|in:online,cabinet,both',
            'service_ids'=> 'nullable|array',
        ]);

        $sessionDate = $this->resolveDate($data['day'], $data['week_offset'], $data['start_time']);

        // Check no duplicate slot for same therapist at same datetime
        $exists = Schedule::where('therapist_id', $therapist->id)
            ->where('session_date', $sessionDate)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Un créneau existe déjà à cette heure.'], 422);
        }

        $slot = Schedule::create([
            'therapist_id' => $therapist->id,
            'session_date' => $sessionDate,
            'category'     => 'consultation',
            'mode'         => $data['mode'],
            'service_ids'  => $data['service_ids'] ?? [],
            'status'       => 'available',
        ]);

        return response()->json([
            'id'         => (string)$slot->id,
            'day'        => $data['day'],
            'startTime'  => $data['start_time'],
            'mode'       => $slot->mode,
            'serviceIds' => $slot->service_ids ?? [],
            'status'     => $slot->status,
            'weekOffset' => $data['week_offset'],
        ], 201);
    }

    /**
     * Update an existing slot (time, mode, services).
     */
    public function update(Request $request, string $id)
    {
        $therapist = $request->user()->therapist;

        $slot = Schedule::where('id', $id)
            ->where('therapist_id', $therapist->id)
            ->firstOrFail();

        $data = $request->validate([
            'day'        => 'sometimes|in:lun,mar,mer,jeu,ven,sam',
            'week_offset'=> 'sometimes|integer|min:0',
            'start_time' => 'sometimes|date_format:H:i',
            'mode'       => 'sometimes|in:online,cabinet,both',
            'service_ids'=> 'nullable|array',
        ]);

        if (isset($data['day']) && isset($data['week_offset']) && isset($data['start_time'])) {
            $data['session_date'] = $this->resolveDate($data['day'], $data['week_offset'], $data['start_time']);
        }

        $slot->update([
            'session_date' => $data['session_date'] ?? $slot->session_date,
            'mode'         => $data['mode'] ?? $slot->mode,
            'service_ids'  => $data['service_ids'] ?? $slot->service_ids,
        ]);

        return response()->json(['message' => 'Créneau mis à jour.', 'slot' => $slot]);
    }

    /**
     * Delete a slot (only if no confirmed booking exists).
     */
    public function destroy(Request $request, string $id)
    {
        $therapist = $request->user()->therapist;

        $slot = Schedule::where('id', $id)
            ->where('therapist_id', $therapist->id)
            ->firstOrFail();

        if ($slot->status === 'booked') {
            return response()->json(['message' => 'Impossible de supprimer un créneau avec une réservation confirmée.'], 422);
        }

        $slot->delete();

        return response()->json(['message' => 'Créneau supprimé.']);
    }
}
