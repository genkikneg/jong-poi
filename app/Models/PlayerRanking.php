<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlayerRanking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'period',
        'total_points',
        'average_points',
        'top_rate',
        'games_played',
        'top_finishes',
        'stats',
    ];

    protected $casts = [
        'total_points' => 'decimal:2',
        'average_points' => 'decimal:2',
        'top_rate' => 'decimal:4',
        'stats' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

}
