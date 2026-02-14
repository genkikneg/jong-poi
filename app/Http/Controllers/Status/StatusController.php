<?php

namespace App\Http\Controllers\Status;

use App\Http\Controllers\Controller;
use App\Models\GameResult;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StatusController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $baseQuery = GameResult::query()->where('user_id', $user->id);

        $totalPoints = (float) (clone $baseQuery)->sum('points');
        $totalGames = (clone $baseQuery)->count();

        $rankCounts = (clone $baseQuery)
            ->selectRaw('rank, COUNT(*) as total')
            ->groupBy('rank')
            ->pluck('total', 'rank');

        $bestGamePoints = (clone $baseQuery)->max('points') ?? 0;
        $worstGamePoints = (clone $baseQuery)->min('points') ?? 0;

        $sessionTotals = GameResult::query()
            ->where('user_id', $user->id)
            ->selectRaw('session_id, COALESCE(SUM(points), 0) as total_points')
            ->groupBy('session_id')
            ->get();

        $sessionCount = $sessionTotals->count();
        $bestSessionPoints = (float) ($sessionTotals->max('total_points') ?? 0);
        $worstSessionPoints = (float) ($sessionTotals->min('total_points') ?? 0);
        $averageSessionPoints = $sessionCount > 0 ? (float) $sessionTotals->avg('total_points') : 0;

        $flyingCount = (clone $baseQuery)->where('final_score', '<', 0)->count();
        $flyingRate = $totalGames > 0 ? $flyingCount / $totalGames : 0;

        $recentGames = (clone $baseQuery)
            ->with(['session:id,name', 'game:id,session_id,ordinal,played_at'])
            ->latest('created_at')
            ->limit(10)
            ->get()
            ->map(function (GameResult $result) {
                return [
                    'id' => $result->id,
                    'points' => (string) $result->points,
                    'rank' => $result->rank,
                    'final_score' => (string) $result->final_score,
                    'session' => $result->session ? [
                        'id' => $result->session->id,
                        'name' => $result->session->name,
                    ] : null,
                    'played_at' => optional($result->game?->played_at ?? $result->created_at)->toIso8601String(),
                ];
            })
            ->values();

        $rankTrend = $recentGames
            ->sortBy(fn ($game) => $game['played_at'] ?? '')
            ->values()
            ->map(fn ($game, $index) => [
                'label' => $game['played_at'],
                'rank' => $game['rank'],
                'order' => $index + 1,
            ])
            ->values();

        $rankRates = collect(range(1, 4))->mapWithKeys(function ($rank) use ($rankCounts, $totalGames) {
            $count = (int) ($rankCounts[$rank] ?? 0);

            return [
                $rank => [
                    'count' => $count,
                    'rate' => $totalGames > 0 ? $count / $totalGames : 0,
                ],
            ];
        });

        return Inertia::render('status/index', [
            'summary' => [
                'total_points' => (string) $totalPoints,
                'total_games' => $totalGames,
                'total_sessions' => $sessionCount,
            ],
            'recentGames' => $recentGames,
            'rankTrend' => $rankTrend,
            'detailedStats' => [
                'rank_rates' => $rankRates,
                'best_game_points' => (string) $bestGamePoints,
                'worst_game_points' => (string) $worstGamePoints,
                'best_session_points' => (string) $bestSessionPoints,
                'worst_session_points' => (string) $worstSessionPoints,
                'average_session_points' => (string) $averageSessionPoints,
                'flying_rate' => $flyingRate,
            ],
        ]);
    }
}
