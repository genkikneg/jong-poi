<?php

namespace App\Http\Controllers\Friends;

use App\Http\Controllers\Controller;
use App\Http\Requests\Friends\SendFriendRequestRequest;
use App\Models\FriendRequest;
use App\Models\Friendship;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FriendRequestController extends Controller
{
    public function store(SendFriendRequestRequest $request): RedirectResponse
    {
        $recipient = $request->recipient();

        if (! $recipient) {
            return back();
        }

        $request->user()
            ->sentFriendRequests()
            ->create([
                'recipient_id' => $recipient->id,
            ]);

        return back()->with('status', 'friend-request-sent');
    }

    public function accept(Request $request, FriendRequest $friendRequest): RedirectResponse
    {
        $this->ensureRecipient($request, $friendRequest);
        $this->ensurePending($friendRequest);

        DB::transaction(function () use ($friendRequest) {
            $friendRequest->markAccepted();

            Friendship::firstOrCreate([
                'user_id' => $friendRequest->sender_id,
                'friend_id' => $friendRequest->recipient_id,
            ]);

            Friendship::firstOrCreate([
                'user_id' => $friendRequest->recipient_id,
                'friend_id' => $friendRequest->sender_id,
            ]);
        });

        return back()->with('status', 'friend-request-accepted');
    }

    public function destroy(Request $request, FriendRequest $friendRequest): RedirectResponse
    {
        $this->ensureParticipant($request, $friendRequest);
        $this->ensurePending($friendRequest);

        $friendRequest->markDeclined();

        return back()->with('status', 'friend-request-declined');
    }

    protected function ensureRecipient(Request $request, FriendRequest $friendRequest): void
    {
        abort_unless(
            $request->user() && $friendRequest->recipient_id === $request->user()->id,
            403,
        );
    }

    protected function ensureParticipant(Request $request, FriendRequest $friendRequest): void
    {
        $userId = $request->user()?->id;

        abort_unless(
            $userId && ($friendRequest->recipient_id === $userId || $friendRequest->sender_id === $userId),
            403,
        );
    }

    protected function ensurePending(FriendRequest $friendRequest): void
    {
        abort_if(! $friendRequest->isPending(), 422);
    }
}
