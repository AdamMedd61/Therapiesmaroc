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
        'content_url',
    ];

    public function therapist()
    {
        return $this->belongsTo(Therapist::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}
