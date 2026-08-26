<?php

namespace App\Http\Controllers\Friends;

use App\Http\Controllers\Controller;
use App\Models\GameResult;
use App\Services\RankingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FriendController extends Controller
{
    public function __construct(private readonly RankingService $rankingService) {}

    public function index(Request $request): Response
    {
        $user = $request->user()->loadMissing([
            'friends:id,name,user_id,friend_code,avatar_path,avatar_public_id',
            'sentFriendRequests' => fn ($query) => $query->pending()->with('recipient:id,name,user_id,friend_code')->latest(),
            'receivedFriendRequests' => fn ($query) => $query->pending()->with('sender:id,name,user_id,friend_code')->latest(),
        ]);

        $friends = $user->friends->sortBy('name')->values();
        $friendIds = $friends->pluck('id');

        $totalPoints = GameResult::query()
            ->whereIn('user_id', $friendIds)
            ->selectRaw('user_id, COALESCE(SUM(points), 0) as total_points')
            ->groupBy('user_id')
            ->pluck('total_points', 'user_id');

        return Inertia::render('friends/index', [
            'friendCode' => $user->friend_code,
            'friends' => $friends
                ->map(function ($friend) use ($totalPoints) {
                    $recentGames = GameResult::query()
                        ->where('user_id', $friend->id)
                        ->with([
                            'session:id,name',
                            'game:id,session_id,ordinal,played_at',
                        ])
                        ->latest('created_at')
                        ->limit(10)
                        ->get()
                        ->map(fn ($result) => [
                            'id' => $result->id,
                            'points' => (string) $result->points,
                            'rank' => $result->rank,
                            'session' => $result->session ? [
                                'id' => $result->session->id,
                                'name' => $result->session->name,
                            ] : null,
                            'played_at' => optional($result->game?->played_at ?? $result->created_at)->toIso8601String(),
                        ])
                        ->values();

                    return [
                        'id' => $friend->id,
                        'name' => $friend->name,
                        'user_id' => $friend->usesEmailAsUserId() ? null : $friend->user_id,
                        'friend_code' => $friend->friend_code,
                        'avatar' => $friend->avatar,
                        'relation_status' => 'friend',
                        'rankings' => $this->rankingService->rankingBadges($friend->id),
                        'stats' => [
                            'total_points' => (string) ($totalPoints[$friend->id] ?? 0),
                            'recent_games' => $recentGames,
                        ],
                    ];
                })
                ->values(),
            'incomingRequests' => $user->receivedFriendRequests
                ->map(fn ($request) => [
                    'id' => $request->id,
                    'sender' => [
                        'id' => $request->sender->id,
                        'name' => $request->sender->name,
                        'user_id' => $request->sender->usesEmailAsUserId() ? null : $request->sender->user_id,
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
                        'user_id' => $request->recipient->usesEmailAsUserId() ? null : $request->recipient->user_id,
                        'friend_code' => $request->recipient->friend_code,
                    ],
                    'created_at' => $request->created_at?->toIso8601String(),
                ])
                ->values(),
        ]);
    }
}
