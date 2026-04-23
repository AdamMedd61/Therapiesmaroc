<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Client;
use App\Models\Therapist;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request) {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:patient,therapist',
            'location' => 'nullable|string|max:255',
            'date_of_birth' => 'nullable|date',
            'CIN' => 'nullable|string|unique:users',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'location' => $request->location,
            'date_of_birth' => $request->date_of_birth,
            'CIN' => $request->CIN,
        ]);

        if ($request->role === 'patient') {
            Client::create(['user_id' => $user->id]);
        } else {
            Therapist::create([
                'user_id' => $user->id,
                'specialization' => 'Général',
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->load($request->role === 'patient' ? 'client' : 'therapist'),
            'token' => $token,
        ], 201);
    }

    public function login(Request $request) {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid login details'
            ], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->load($user->role === 'patient' ? 'client' : 'therapist'),
            'token' => $token,
        ]);
    }

    public function logout(Request $request) {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Successfully logged out'
        ]);
    }

    public function me(Request $request) {
        $user = $request->user();
        return response()->json($user->load($user->role === 'patient' ? 'client' : 'therapist'));
    }

    public function updateProfile(Request $request) {
        $user = $request->user();

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,'.$user->id,
            'tel' => 'sometimes|nullable|string|max:20',
            'city' => 'sometimes|nullable|string|max:100',
            'address' => 'sometimes|nullable|string|max:255',
            'avatar' => 'sometimes|nullable|image|max:5120',
        ]);

        if ($request->has('city')) {
            $data['location'] = $request->city;
            unset($data['city']);
        }

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $data['avatar_url'] = '/storage/' . $path;
            unset($data['avatar']);
        }

        $user->update($data);

        return response()->json($user->load($user->role === 'patient' ? 'client' : 'therapist'));
    }
}
