<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = [
        'client_id',
        'therapist_id',
        'schedule_id',
        'rating',
        'comment',
        'review_date',
    ];

    protected function casts(): array
    {
        return [
            'review_date' => 'date',
            'rating' => 'integer',
        ];
    }

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
}
