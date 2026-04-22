<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Service;

class ServiceController extends Controller
{
    /**
     * List all services for the authenticated therapist.
     */
    public function index(Request $request)
    {
        $therapist = $request->user()->therapist;

        if (!$therapist) {
            return response()->json(['message' => 'Therapist profile not found.'], 403);
        }

        return response()->json($therapist->services()->orderBy('name')->get());
    }

    /**
     * Create a new service for the authenticated therapist.
     */
    public function store(Request $request)
    {
        $therapist = $request->user()->therapist;

        if (!$therapist) {
            return response()->json(['message' => 'Therapist profile not found.'], 403);
        }

        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'duration' => 'required|string|max:50',
            'price'    => 'required|numeric|min:0',
            'mode'     => 'required|in:online,cabinet,both',
        ]);

        $service = $therapist->services()->create($data);

        return response()->json($service, 201);
    }

    /**
     * Update an existing service (must belong to auth therapist).
     */
    public function update(Request $request, string $id)
    {
        $therapist = $request->user()->therapist;

        $service = Service::where('id', $id)
            ->where('therapist_id', $therapist->id)
            ->firstOrFail();

        $data = $request->validate([
            'name'     => 'sometimes|string|max:255',
            'duration' => 'sometimes|string|max:50',
            'price'    => 'sometimes|numeric|min:0',
            'mode'     => 'sometimes|in:online,cabinet,both',
        ]);

        $service->update($data);

        return response()->json($service);
    }

    /**
     * Delete a service (must belong to auth therapist).
     */
    public function destroy(Request $request, string $id)
    {
        $therapist = $request->user()->therapist;

        $service = Service::where('id', $id)
            ->where('therapist_id', $therapist->id)
            ->firstOrFail();

        $service->delete();

        return response()->json(['message' => 'Service supprimé.']);
    }
}
