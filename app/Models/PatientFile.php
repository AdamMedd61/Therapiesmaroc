<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PatientFile extends Model
{
    protected $table = 'files';

    protected $fillable = [
        'therapist_id',
        'client_id',
        'file_name',
        'file_type',
        'upload_date',
        'content_url',
    ];

    protected function casts(): array
    {
        return [
            'upload_date' => 'datetime',
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
}
