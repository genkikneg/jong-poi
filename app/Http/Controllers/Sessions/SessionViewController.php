<?php

namespace App\Http\Controllers\Sessions;

use App\Enums\SessionStatus;
use App\Http\Controllers\Controller;
use App\Models\Session;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SessionViewController extends Controller
{
    public function create(Request $request): Response
    {
        $friends = $request->user()->friends()
            ->select('users.id', 'users.name', 'users.friend_code', 'users.avatar_path', 'users.avatar_public_id')
            ->orderBy('users.name')
            ->get()
            ->map(fn ($friend) => [
                'id' => $friend->id,
                'name' => $friend->name,
                'friend_code' => $friend->friend_code,
                'avatar' => $friend->avatar,
            ]);

        return Inertia::render('sessions/create', [
            'friends' => $friends,
        ]);
    }

    public function join(Request $request): Response
    {
        $user = $request->user();

        $pendingSessions = Session::query()
            ->where('status', SessionStatus::Open)
            ->whereHas('members', fn ($query) => $query
                ->where('user_id', $user->id)
                ->whereNull('joined_at'))
            ->with(['owner:id,name'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Session $session) => [
                'id' => $session->id,
                'name' => $session->name,
                'owner' => $session->owner?->name,
                'join_code' => $session->join_code,
                'player_count' => $session->player_count,
            ]);

        return Inertia::render('sessions/join', [
            'pendingSessions' => $pendingSessions,
        ]);
    }

    public function history(Request $request): Response
    {
        $user = $request->user();

        $filters = $request->validate([
            'period' => ['nullable', 'in:all,year,month,week'],
            'player_count' => ['nullable', 'integer', 'in:3,4'],
            'opponent_id' => ['nullable', 'integer', 'exists:users,id'],
            'query' => ['nullable', 'string', 'max:120'],
            'per_page' => ['nullable', 'integer', 'in:10,50,100'],
        ]);

        $sessions = Session::query()
            ->where('status', SessionStatus::Closed->value)
            ->whereHas('members', fn ($query) => $query->where('user_id', $user->id))
            ->when($filters['player_count'] ?? null, fn ($query, $count) => $query->where('player_count', $count))
            ->when($filters['opponent_id'] ?? null, fn ($query, $opponentId) => $query->whereHas('members', fn ($members) => $members->where('user_id', $opponentId)))
            ->when($filters['query'] ?? null, fn ($query, $term) => $query->where('name', 'like', '%'.$term.'%'))
            ->when(($filters['period'] ?? 'all') !== 'all', function ($query) use ($filters) {
                $start = match ($filters['period']) {
                    'week' => now()->startOfWeek(),
                    'month' => now()->startOfMonth(),
                    'year' => now()->startOfYear(),
                };
                $query->where('closed_at', '>=', $start);
            })
            ->with(['games.results', 'members.user:id,name,avatar_path,avatar_public_id'])
            ->latest('closed_at')
            ->paginate((int) ($filters['per_page'] ?? 10))
            ->withQueryString()
            ->through(function (Session $session) use ($user) {
                $totals = $session->games->flatMap->results->groupBy('user_id')
                    ->map(fn ($results) => (float) $results->sum('points'))->sortDesc();
                $userTotal = (float) ($totals[$user->id] ?? 0);
                $rank = $totals->has($user->id) ? $totals->values()->search($userTotal) + 1 : null;

                return [
                    'id' => $session->id,
                    'name' => $session->name,
                    'player_count' => $session->player_count,
                    'closed_at' => optional($session->closed_at ?? $session->updated_at)->toIso8601String(),
                    'total_points' => (string) $userTotal,
                    'rank' => $rank,
                    'game_count' => $session->games->count(),
                    'members' => $session->members->map(fn ($member) => [
                        'id' => $member->user->id,
                        'name' => $member->user->name,
                        'avatar' => $member->user->avatar,
                    ])->values(),
                ];
            });

        $opponents = User::query()->whereKeyNot($user->id)
            ->whereHas('sessionMemberships.session', fn ($query) => $query
                ->where('status', SessionStatus::Closed->value)
                ->whereHas('members', fn ($members) => $members->where('user_id', $user->id)))
            ->select('id', 'name')->orderBy('name')->get();

        return Inertia::render('sessions/history', [
            'sessions' => $sessions,
            'opponents' => $opponents,
            'filters' => [
                'period' => $filters['period'] ?? 'all',
                'player_count' => isset($filters['player_count']) ? (int) $filters['player_count'] : null,
                'opponent_id' => isset($filters['opponent_id']) ? (int) $filters['opponent_id'] : null,
                'query' => $filters['query'] ?? '',
                'per_page' => (int) ($filters['per_page'] ?? 10),
            ],
        ]);
    }
}
