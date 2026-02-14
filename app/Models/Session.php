<?php

namespace App\Models;

use App\Enums\SessionStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Session extends Model
{
    use HasFactory;

    protected $table = 'mahjong_sessions';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'owner_id',
        'name',
        'player_count',
        'status',
        'join_code',
        'rules_snapshot',
        'rule_base',
        'rule_k',
        'rule_rank_bonus',
        'closed_at',
    ];

    protected $casts = [
        'rules_snapshot' => 'array',
        'rule_rank_bonus' => 'array',
        'rule_base' => 'decimal:1',
        'rule_k' => 'decimal:4',
        'status' => SessionStatus::class,
        'closed_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $session) {
            if (! $session->join_code) {
                $session->join_code = static::generateJoinCode();
            }

            if (! $session->status) {
                $session->status = SessionStatus::Open;
            }
        });
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function members(): HasMany
    {
        return $this->hasMany(SessionMember::class);
    }

    public function games(): HasMany
    {
        return $this->hasMany(Game::class);
    }

    public function results(): HasMany
    {
        return $this->hasMany(GameResult::class);
    }

    public function gameDraft(): HasOne
    {
        return $this->hasOne(SessionGameDraft::class, 'session_id');
    }

    public function isClosed(): bool
    {
        return $this->status === SessionStatus::Closed;
    }

    public function markClosed(): void
    {
        $this->forceFill([
            'status' => SessionStatus::Closed,
            'closed_at' => now(),
        ])->save();
    }

    public static function generateJoinCode(): string
    {
        do {
            $code = strtoupper(Str::random(6));
        } while (static::where('join_code', $code)->exists());

        return $code;
    }
}
