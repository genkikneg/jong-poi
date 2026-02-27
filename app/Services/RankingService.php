<?php

namespace App\Services;

use App\Models\GameResult;
use App\Models\PlayerRanking;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\Cache;

class RankingService
{
    public const PERIODS = [
        'all',
        'year',
        'month',
        'week',
    ];

    public function updateForUser(User $user): void
    {
        foreach (self::PERIODS as $period) {
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
        $order = Cache::remember("ranking_order_all_{$column}", 300, function () use ($column) {
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
        $query = GameResult::query()->where('user_id', $userId);

        if ($period !== 'all') {
            $query->where('created_at', '>=', $this->periodStart($period));
        }

        $results = $query->get();

        if ($results->isEmpty()) {
            return [
                'games_played' => 0,
                'total_points' => 0,
                'average_points' => 0,
                'top_finishes' => 0,
                'top_rate' => 0,
                'recent_games' => [],
            ];
        }

        $gamesPlayed = $results->count();
        $totalPoints = (float) $results->sum('points');
        $averagePoints = $gamesPlayed > 0 ? $totalPoints / $gamesPlayed : 0;
        $topFinishes = $results->where('rank', 1)->count();
        $topRate = $gamesPlayed > 0 ? $topFinishes / $gamesPlayed : 0;

        $recentGames = GameResult::query()
            ->where('user_id', $userId)
            ->when($period !== 'all', fn ($q) => $q->where('created_at', '>=', $this->periodStart($period)))
            ->with(['session:id,name', 'game:id,session_id,ordinal,played_at'])
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
            'week' => $now->copy()->startOfWeek(),
            default => $now->copy()->startOfCentury(),
        };
    }
}
