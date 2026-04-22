<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'request_id',
        'schedule_id',
        'client_id',
        'amount',
        'currency',
        'stripe_payment_intent_id',
        'status',
        'paid_at',
    ];

    protected $casts = [
        'paid_at' => 'datetime',
    ];

    public function request()
    {
        return $this->belongsTo(BookingRequest::class, 'request_id');
    }

    public function schedule()
    {
        return $this->belongsTo(Schedule::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}
