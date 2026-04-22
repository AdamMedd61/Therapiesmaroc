<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = [
        'therapist_id',
        'name',
        'duration',
        'price',
        'mode',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
        ];
    }

    public function therapist()
    {
        return $this->belongsTo(Therapist::class);
    }
}
