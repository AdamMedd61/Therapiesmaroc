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

Route::get('/therapists', [TherapistController::class, 'index']); // Public endpoint

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // API Resources
    Route::apiResource('schedules', ScheduleController::class);
    Route::apiResource('files', PatientFileController::class);
    Route::apiResource('requests', BookingRequestController::class);
    Route::apiResource('therapists', TherapistController::class)->except(['index']);
    Route::apiResource('clients', ClientController::class);
    Route::apiResource('payments', PaymentController::class);
    Route::apiResource('reviews', ReviewController::class);
});
