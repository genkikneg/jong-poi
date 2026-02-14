<?php

namespace App\Models;

use App\Enums\FriendRequestStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FriendRequest extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'sender_id',
        'recipient_id',
        'status',
    ];

    protected $casts = [
        'status' => FriendRequestStatus::class,
    ];

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }

    public function scopePending($query)
    {
        return $query->where('status', FriendRequestStatus::Pending);
    }

    public function markAccepted(): void
    {
        $this->forceFill(['status' => FriendRequestStatus::Accepted])->save();
    }

    public function markDeclined(): void
    {
        $this->forceFill(['status' => FriendRequestStatus::Declined])->save();
    }

    public function isPending(): bool
    {
        return $this->status === FriendRequestStatus::Pending;
    }
}
