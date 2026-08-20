<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * Bootstrap the model.
     */
    protected static function booted(): void
    {
        static::creating(function (self $user) {
            if (! $user->friend_code) {
                $user->friend_code = static::generateFriendCode();
            }

            if (! $user->avatar_public_id) {
                $user->avatar_public_id = (string) Str::uuid();
            }
        });
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'friend_code',
        'avatar_path',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'avatar_public_id',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    protected $appends = [
        'avatar',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function friendships(): HasMany
    {
        return $this->hasMany(Friendship::class);
    }

    public function friends(): BelongsToMany
    {
        return $this->belongsToMany(self::class, 'friendships', 'user_id', 'friend_id')
            ->withTimestamps();
    }

    public function sentFriendRequests(): HasMany
    {
        return $this->hasMany(FriendRequest::class, 'sender_id');
    }

    public function receivedFriendRequests(): HasMany
    {
        return $this->hasMany(FriendRequest::class, 'recipient_id');
    }

    public function isFriendsWith(self $user): bool
    {
        return $this->friends()->where('friend_id', $user->id)->exists();
    }

    public function hasPendingFriendRequestWith(self $user): bool
    {
        return FriendRequest::query()
            ->pending()
            ->where(function ($query) use ($user) {
                $query
                    ->where(function ($inner) use ($user) {
                        $inner->where('sender_id', $this->id)
                            ->where('recipient_id', $user->id);
                    })
                    ->orWhere(function ($inner) use ($user) {
                        $inner->where('sender_id', $user->id)
                            ->where('recipient_id', $this->id);
                    });
            })
            ->exists();
    }

    public static function generateFriendCode(): string
    {
        do {
            $code = Str::upper(Str::random(8));
        } while (static::query()->where('friend_code', $code)->exists());

        return $code;
    }

    public function getAvatarAttribute(): ?string
    {
        if (! $this->avatar_path || ! $this->avatar_public_id) {
            return null;
        }

        return URL::route('avatars.show', ['avatarId' => $this->avatar_public_id]);
    }
}
