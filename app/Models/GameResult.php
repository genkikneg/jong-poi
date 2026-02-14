<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GameResult extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'game_id',
        'session_id',
        'user_id',
        'final_score',
        'rank',
        'points',
        'score_diff',
        'score_diff_scaled',
        'rank_bonus',
    ];

    protected $casts = [
        'final_score' => 'decimal:1',
        'points' => 'decimal:4',
        'score_diff' => 'decimal:1',
        'score_diff_scaled' => 'decimal:4',
        'rank_bonus' => 'decimal:4',
    ];

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(Session::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
