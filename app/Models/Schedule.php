<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    protected $fillable = [
        'therapist_id',
        'client_id',
        'category',
        'session_date',
        'mode',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'session_date' => 'datetime',
        ];
    }

    public function therapist()
    {
        return $this->belongsTo(Therapist::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function requests()
    {
        return $this->hasMany(BookingRequest::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    public function review()
    {
        return $this->hasOne(Review::class);
    }
}
