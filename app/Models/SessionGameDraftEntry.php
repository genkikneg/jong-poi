<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SessionGameDraftEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'draft_id',
        'session_id',
        'user_id',
        'final_score',
        'rank',
    ];

    protected $casts = [
        'final_score' => 'decimal:1',
    ];

    public function draft(): BelongsTo
    {
        return $this->belongsTo(SessionGameDraft::class, 'draft_id');
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
