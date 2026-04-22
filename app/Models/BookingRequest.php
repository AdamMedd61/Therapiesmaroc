<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingRequest extends Model
{
    protected $table = 'requests';

    protected $fillable = [
        'client_id',
        'therapist_id',
        'service_id',
        'schedule_id',
        'commentary',
        'status',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function therapist()
    {
        return $this->belongsTo(Therapist::class);
    }

    public function schedule()
    {
        return $this->belongsTo(Schedule::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
