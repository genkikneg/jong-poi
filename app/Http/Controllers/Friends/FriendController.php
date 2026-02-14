<?php

namespace App\Http\Controllers\Friends;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FriendController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user()->loadMissing([
            'friends:id,name,friend_code',
            'sentFriendRequests' => fn ($query) => $query->pending()->with('recipient:id,name,friend_code')->latest(),
            'receivedFriendRequests' => fn ($query) => $query->pending()->with('sender:id,name,friend_code')->latest(),
        ]);

        return Inertia::render('friends/index', [
            'friendCode' => $user->friend_code,
            'friends' => $user->friends
                ->sortBy('name')
                ->map(fn ($friend) => [
                    'id' => $friend->id,
                    'name' => $friend->name,
                    'friend_code' => $friend->friend_code,
                ])
                ->values(),
            'incomingRequests' => $user->receivedFriendRequests
                ->map(fn ($request) => [
                    'id' => $request->id,
                    'sender' => [
                        'id' => $request->sender->id,
                        'name' => $request->sender->name,
                        'friend_code' => $request->sender->friend_code,
                    ],
                    'created_at' => $request->created_at?->toIso8601String(),
                ])
                ->values(),
            'outgoingRequests' => $user->sentFriendRequests
                ->map(fn ($request) => [
                    'id' => $request->id,
                    'recipient' => [
                        'id' => $request->recipient->id,
                        'name' => $request->recipient->name,
                        'friend_code' => $request->recipient->friend_code,
                    ],
                    'created_at' => $request->created_at?->toIso8601String(),
                ])
                ->values(),
        ]);
    }
}
