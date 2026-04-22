<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\PatientFileController;
use App\Http\Controllers\BookingRequestController;
use App\Http\Controllers\TherapistController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ReviewController;

use App\Http\Controllers\ServiceController;
use App\Http\Controllers\TherapistStatsController;

Route::get('/therapists', [TherapistController::class, 'index']);           // Public: list therapists with available slots
Route::get('/therapists/{id}', [TherapistController::class, 'show']);      // Public: single therapist profile
Route::get('/therapists/{id}/services', [ServiceController::class, 'index']); // Public: therapist services

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/profile', [AuthController::class, 'updateProfile']);
    
    // API Resources
    Route::apiResource('schedules', ScheduleController::class);
    Route::apiResource('services', ServiceController::class);
    Route::apiResource('files', PatientFileController::class);
    Route::apiResource('requests', BookingRequestController::class);
    Route::apiResource('therapists', TherapistController::class)->only(['update', 'destroy']);
    Route::apiResource('clients', ClientController::class);
    Route::apiResource('reviews', ReviewController::class);

    // Stripe payment routes
    Route::post('/payments/checkout', [PaymentController::class, 'createCheckout']);
    Route::post('/payments/confirm-checkout', [PaymentController::class, 'confirmCheckout']);
    Route::get('/payments', [PaymentController::class, 'index']);

    // Therapist stats
    Route::get('/therapist/stats', [TherapistStatsController::class, 'index']);
});
