<?php

namespace App\Services;

use App\Enums\SessionStatus;
use App\Models\GameResult;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class PlayerStatisticsService
{
    public const PERIODS = ['all', 'year', 'month', 'week', 'custom'];

    public function build(User $user, array $filters): array
    {
        $results = $this->query($user->id, $filters)
            ->with(['session:id,name,player_count', 'game:id,session_id,ordinal,played_at'])
            ->orderByRaw('COALESCE(games.played_at, game_results.created_at)')
            ->get();
        $totalGames = $results->count();
        $totalPoints = (float) $results->sum('points');
        $rankCounts = collect(range(1, 4))->mapWithKeys(function (int $rank) use ($results, $totalGames) {
            $count = $results->where('rank', $rank)->count();

            return [$rank => ['count' => $count, 'rate' => $totalGames > 0 ? $count / $totalGames : 0]];
        });
        $sessionTotals = $results->groupBy('session_id')->map(fn (Collection $items) => (float) $items->sum('points'));
        $recent = $results->take(-50)->values();
        $cumulative = 0.0;

        return [
            'summary' => [
                'total_points' => (string) $totalPoints,
                'total_games' => $totalGames,
                'total_sessions' => $sessionTotals->count(),
                'average_points' => $totalGames > 0 ? $totalPoints / $totalGames : null,
                'average_rank' => $totalGames > 0 ? (float) $results->avg('rank') : null,
                'top_rate' => $totalGames > 0 ? $results->where('rank', 1)->count() / $totalGames : null,
                'top_two_rate' => $totalGames > 0 ? $results->whereIn('rank', [1, 2])->count() / $totalGames : null,
                'last_rate' => $totalGames > 0 ? $results->filter(fn ($result) => $result->rank === $result->session->player_count)->count() / $totalGames : null,
            ],
            'detailedStats' => [
                'rank_rates' => $rankCounts,
                'best_game_points' => (string) ($results->max('points') ?? 0),
                'worst_game_points' => (string) ($results->min('points') ?? 0),
                'best_session_points' => (string) ($sessionTotals->max() ?? 0),
                'worst_session_points' => (string) ($sessionTotals->min() ?? 0),
                'average_session_points' => (string) ($sessionTotals->avg() ?? 0),
                'flying_rate' => $totalGames > 0 ? $results->where('final_score', '<', 0)->count() / $totalGames : 0,
            ],
            'recentGames' => $recent->reverse()->values()->take(10)->map(fn (GameResult $result) => $this->gamePayload($result)),
            'trend' => $recent->map(function (GameResult $result) use (&$cumulative) {
                $cumulative += (float) $result->points;

                return [...$this->gamePayload($result), 'cumulative_points' => $cumulative];
            })->values(),
            'opponents' => $this->opponents($user),
        ];
    }

    private function query(int $userId, array $filters): Builder
    {
        $query = GameResult::query()->select('game_results.*')
            ->join('games', 'games.id', '=', 'game_results.game_id')
            ->join('mahjong_sessions', 'mahjong_sessions.id', '=', 'game_results.session_id')
            ->where('game_results.user_id', $userId)
            ->where('mahjong_sessions.status', SessionStatus::Closed->value);

        if ($filters['player_count'] ?? null) {
            $query->where('mahjong_sessions.player_count', $filters['player_count']);
        }
        if ($opponentId = ($filters['opponent_id'] ?? null)) {
            $query->whereExists(fn ($member) => $member->selectRaw('1')->from('session_members')
                ->whereColumn('session_members.session_id', 'game_results.session_id')->where('session_members.user_id', $opponentId));
        }
        [$from, $to] = $this->dateRange($filters);
        if ($from) {
            $query->whereRaw('COALESCE(games.played_at, game_results.created_at) >= ?', [$from]);
        }
        if ($to) {
            $query->whereRaw('COALESCE(games.played_at, game_results.created_at) <= ?', [$to]);
        }

        return $query;
    }

    private function dateRange(array $filters): array
    {
        $now = now();

        return match ($filters['period'] ?? 'all') {
            'week' => [$now->copy()->startOfWeek(), $now->copy()->endOfWeek()],
            'month' => [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()],
            'year' => [$now->copy()->startOfYear(), $now->copy()->endOfYear()],
            'custom' => [
                ($filters['from'] ?? null) ? Carbon::parse($filters['from'])->startOfDay() : null,
                ($filters['to'] ?? null) ? Carbon::parse($filters['to'])->endOfDay() : null,
            ],
            default => [null, null],
        };
    }

    private function gamePayload(GameResult $result): array
    {
        return [
            'id' => $result->id, 'points' => (string) $result->points, 'rank' => $result->rank,
            'final_score' => (string) $result->final_score,
            'played_at' => optional($result->game?->played_at ?? $result->created_at)->toIso8601String(),
            'session' => $result->session ? ['id' => $result->session->id, 'name' => $result->session->name, 'player_count' => $result->session->player_count] : null,
        ];
    }

    private function opponents(User $user): Collection
    {
        return User::query()->whereKeyNot($user->id)
            ->whereHas('sessionMemberships.session', fn ($query) => $query->where('status', SessionStatus::Closed->value)
                ->whereHas('members', fn ($members) => $members->where('user_id', $user->id)))
            ->select('id', 'name', 'avatar_path', 'avatar_public_id')->orderBy('name')->get()
            ->map(fn (User $opponent) => ['id' => $opponent->id, 'name' => $opponent->name, 'avatar' => $opponent->avatar]);
    }
}
