<?php

namespace App\Services;

use App\Enums\SessionStatus;
use App\Models\GameResult;
use App\Models\PlayerRanking;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Cache;

class RankingService
{
    public const PERIODS = [
        'all',
        'year',
        'month',
    ];

    /**
     * @param  array<int, string>|null  $periods
     */
    public function updateForUser(User $user, ?array $periods = null): void
    {
        foreach ($periods ?? self::PERIODS as $period) {
            $stats = $this->calculateStats($user->id, $period);

            if ($stats['games_played'] < 5) {
                PlayerRanking::query()
                    ->where('user_id', $user->id)
                    ->where('period', $period)
                    ->delete();

                continue;
            }

            PlayerRanking::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'period' => $period,
                ],
                [
                    'total_points' => $stats['total_points'],
                    'average_points' => $stats['average_points'],
                    'top_rate' => $stats['top_rate'],
                    'games_played' => $stats['games_played'],
                    'top_finishes' => $stats['top_finishes'],
                    'stats' => [
                        'total_points' => (string) $stats['total_points'],
                        'recent_games' => $stats['recent_games'],
                    ],
                ]
            );
        }

        $this->forgetPositionCache();
    }

    public function rankingBadges(int $userId): array
    {
        $metrics = [
            '累計' => 'total_points',
            '平均' => 'average_points',
            'トップ率' => 'top_rate',
        ];

        $badges = [];

        foreach ($metrics as $label => $column) {
            $position = $this->positionFor($userId, $column);

            if ($position !== null && $position <= 3) {
                $badges[] = [
                    'label' => $label,
                    'value' => '第'.$position.'位',
                ];
            }
        }

        return $badges;
    }

    protected function positionFor(int $userId, string $column): ?int
    {
        $order = Cache::remember("ranking_order:all:{$column}", 300, function () use ($column) {
            return PlayerRanking::query()
                ->where('period', 'all')
                ->orderByDesc($column)
                ->pluck('user_id')
                ->values();
        });

        $index = $order->search($userId);

        return $index === false ? null : $index + 1;
    }

    protected function calculateStats(int $userId, string $period): array
    {
        $query = $this->resultsQuery($userId);

        if ($period !== 'all') {
            $query->whereRaw(
                'COALESCE(games.played_at, game_results.created_at) >= ?',
                [$this->periodStart($period)],
            );
        }

        $summary = $query
            ->selectRaw('COUNT(*) as games_played')
            ->selectRaw('COALESCE(SUM(game_results.points), 0) as total_points')
            ->selectRaw('COALESCE(AVG(game_results.points), 0) as average_points')
            ->selectRaw('SUM(CASE WHEN game_results.rank = 1 THEN 1 ELSE 0 END) as top_finishes')
            ->first();

        $gamesPlayed = (int) ($summary?->games_played ?? 0);
        $totalPoints = (float) ($summary?->total_points ?? 0);
        $averagePoints = (float) ($summary?->average_points ?? 0);
        $topFinishes = (int) ($summary?->top_finishes ?? 0);
        $topRate = $gamesPlayed > 0 ? $topFinishes / $gamesPlayed : 0;

        $recentGames = $this->resultsQuery($userId)
            ->when($period !== 'all', fn (Builder $query) => $query->whereRaw(
                'COALESCE(games.played_at, game_results.created_at) >= ?',
                [$this->periodStart($period)],
            ))
            ->select('game_results.*')
            ->with(['session:id,name', 'game:id,session_id,ordinal,played_at'])
            ->orderByRaw('COALESCE(games.played_at, game_results.created_at) DESC')
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
            'games_played' => $gamesPlayed,
            'total_points' => $totalPoints,
            'average_points' => $averagePoints,
            'top_finishes' => $topFinishes,
            'top_rate' => $topRate,
            'recent_games' => $recentGames,
        ];
    }

    protected function periodStart(string $period): CarbonInterface
    {
        $now = now();

        return match ($period) {
            'year' => $now->copy()->startOfYear(),
            'month' => $now->copy()->startOfMonth(),
            default => $now->copy()->startOfCentury(),
        };
    }

    public function forgetPositionCache(): void
    {
        foreach (['total_points', 'average_points', 'top_rate'] as $column) {
            Cache::forget("ranking_order:all:{$column}");
        }
    }

    private function resultsQuery(int $userId): Builder
    {
        return GameResult::query()
            ->where('game_results.user_id', $userId)
            ->join('games', 'games.id', '=', 'game_results.game_id')
            ->join('mahjong_sessions', 'mahjong_sessions.id', '=', 'game_results.session_id')
            ->where('mahjong_sessions.status', SessionStatus::Closed->value);
    }
}
