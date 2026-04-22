<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Payment;
use App\Models\BookingRequest;
use App\Models\Schedule;
use Stripe\Stripe;
use Stripe\Checkout\Session as CheckoutSession;
use Stripe\Exception\ApiErrorException;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(env('STRIPE_SECRET'));
    }

    /**
     * Create a Stripe Checkout Session and return the redirect URL.
     */
    public function createCheckout(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'patient') {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $data = $request->validate([
            'request_id' => 'required|exists:requests,id',
        ]);

        $bookingRequest = BookingRequest::with(['schedule', 'service'])->findOrFail($data['request_id']);

        if ($bookingRequest->status !== 'accepted') {
            return response()->json(['message' => 'Cette demande doit être acceptée avant le paiement.'], 422);
        }

        if ($bookingRequest->client_id !== $user->client->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $amountInCents = (int) ($bookingRequest->service->price * 100);
        $frontendUrl   = env('FRONTEND_URL', 'http://localhost:5174');

        try {
            $session = CheckoutSession::create([
                'mode'                => 'payment',
                'currency'            => 'eur',
                'line_items'          => [[
                    'quantity'   => 1,
                    'price_data' => [
                        'currency'     => 'eur',
                        'unit_amount'  => $amountInCents,
                        'product_data' => [
                            'name'        => $bookingRequest->service->name ?? 'Consultation thérapeutique',
                            'description' => 'Séance avec votre thérapeute sur TherapiesMaroc',
                        ],
                    ],
                ]],
                'metadata'            => [
                    'request_id'   => $bookingRequest->id,
                    'schedule_id'  => $bookingRequest->schedule_id,
                    'client_id'    => $bookingRequest->client_id,
                    'therapist_id' => $bookingRequest->therapist_id,
                ],
                'success_url'         => "{$frontendUrl}/paiement/success?session_id={CHECKOUT_SESSION_ID}&request_id={$bookingRequest->id}",
                'cancel_url'          => "{$frontendUrl}/reservations",
            ]);

            // Store a pending payment record
            Payment::updateOrCreate(
                ['request_id' => $bookingRequest->id],
                [
                    'schedule_id'              => $bookingRequest->schedule_id,
                    'client_id'                => $bookingRequest->client_id,
                    'amount'                   => $bookingRequest->service->price,
                    'currency'                 => 'eur',
                    'stripe_payment_intent_id' => $session->id,
                    'status'                   => 'pending',
                ]
            );

            return response()->json(['checkout_url' => $session->url]);
        } catch (ApiErrorException $e) {
            return response()->json(['message' => 'Erreur Stripe : ' . $e->getMessage()], 500);
        }
    }

    /**
     * Confirm payment after Stripe redirects back.
     * Called from the success page with session_id.
     */
    public function confirmCheckout(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'patient') {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $data = $request->validate([
            'session_id' => 'required|string',
            'request_id' => 'required|exists:requests,id',
        ]);

        try {
            $session = CheckoutSession::retrieve($data['session_id']);

            if ($session->payment_status !== 'paid') {
                return response()->json(['message' => 'Paiement non complété.'], 422);
            }

            DB::transaction(function () use ($data) {
                $bookingRequest = BookingRequest::with('schedule')->findOrFail($data['request_id']);

                // Lock the slot
                $bookingRequest->schedule->update([
                    'status'    => 'booked',
                    'client_id' => $bookingRequest->client_id,
                ]);

                // Refuse all other pending/accepted requests for this slot
                BookingRequest::where('schedule_id', $bookingRequest->schedule_id)
                    ->where('id', '!=', $bookingRequest->id)
                    ->whereIn('status', ['pending', 'accepted'])
                    ->update(['status' => 'refused']);

                // Mark payment as paid
                Payment::where('request_id', $bookingRequest->id)
                    ->update(['status' => 'paid', 'paid_at' => now()]);

                // Mark request as paid
                $bookingRequest->update(['status' => 'paid']);
            });

            return response()->json(['message' => 'Paiement confirmé ! Votre séance est réservée.']);
        } catch (ApiErrorException $e) {
            return response()->json(['message' => 'Erreur Stripe : ' . $e->getMessage()], 500);
        }
    }

    /**
     * List payments for the authenticated user.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'patient') {
            $payments = Payment::with(['schedule.therapist.user'])
                ->where('client_id', $user->client->id)
                ->orderByDesc('created_at')
                ->get();
        } elseif ($user->role === 'therapist') {
            $payments = Payment::with(['schedule', 'client.user'])
                ->whereHas('schedule', fn($q) => $q->where('therapist_id', $user->therapist->id))
                ->orderByDesc('created_at')
                ->get();
        } else {
            return response()->json([], 403);
        }

        return response()->json($payments);
    }
}
