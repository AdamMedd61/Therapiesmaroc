<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Therapist extends Model
{
    protected $fillable = [
        'user_id',
        'specialization',
        'experience',
        'bio',
        'approach',
        'education',
        'languages',
        'specialties'
    ];

    protected $casts = [
        'education' => 'array',
        'languages' => 'array',
        'specialties' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }

    public function requests()
    {
        return $this->hasMany(BookingRequest::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function files()
    {
        return $this->hasMany(PatientFile::class);
    }

    public function services()
    {
        return $this->hasMany(Service::class);
    }
}
