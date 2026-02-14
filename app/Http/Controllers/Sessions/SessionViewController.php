<?php

namespace App\Http\Controllers\Sessions;

use App\Http\Controllers\Controller;
use App\Enums\SessionStatus;
use App\Models\GameResult;
use App\Models\Session;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SessionViewController extends Controller
{
    public function create(Request $request): Response
    {
        $friends = $request->user()->friends()
            ->select('users.id', 'users.name', 'users.friend_code')
            ->orderBy('users.name')
            ->get()
            ->map(fn ($friend) => [
                'id' => $friend->id,
                'name' => $friend->name,
                'friend_code' => $friend->friend_code,
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

        $sessions = Session::query()
            ->whereHas('members', fn ($query) => $query->where('user_id', $user->id))
            ->with(['games.results'])
            ->latest('updated_at')
            ->limit(50)
            ->get()
            ->map(function (Session $session) use ($user) {
                $totals = GameResult::query()
                    ->where('session_id', $session->id)
                    ->selectRaw('user_id, SUM(points) as total_points')
                    ->groupBy('user_id')
                    ->orderByDesc('total_points')
                    ->get();

                $rank = 1;
                $lastPoints = null;
                $userTotal = 0;

                foreach ($totals as $index => $row) {
                    $points = (float) $row->total_points;

                    if ($lastPoints === null || $points !== $lastPoints) {
                        $rank = $index + 1;
                        $lastPoints = $points;
                    }

                    if ($row->user_id === $user->id) {
                        $userTotal = $points;
                        break;
                    }
                }

                return [
                    'id' => $session->id,
                    'name' => $session->name,
                    'player_count' => $session->player_count,
                    'closed_at' => optional($session->closed_at ?? $session->updated_at)->toIso8601String(),
                    'total_points' => (string) $userTotal,
                    'rank' => $rank,
                ];
            });

        return Inertia::render('sessions/history', [
            'sessions' => $sessions,
        ]);
    }
}
