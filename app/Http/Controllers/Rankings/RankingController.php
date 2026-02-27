<?php

namespace App\Http\Controllers\Rankings;

use App\Http\Controllers\Controller;
use App\Models\PlayerRanking;
use App\Services\RankingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RankingController extends Controller
{
    public function __construct(private readonly RankingService $rankingService)
    {
    }

    public function __invoke(Request $request): Response
    {
        $period = $request->string('period')->toString() ?: 'all';

        $players = PlayerRanking::query()
            ->where('period', $period)
            ->with('user:id,name,friend_code,avatar_path')
            ->get()
            ->map(fn ($ranking) => [
                'id' => $ranking->user->id,
                'name' => $ranking->user->name,
                'friend_code' => $ranking->user->friend_code,
                'avatar' => $ranking->user->avatar,
                'stats' => $ranking->stats,
                'rankings' => $this->rankingService->rankingBadges($ranking->user->id),
                'games_played' => $ranking->games_played,
                'total_points' => (float) $ranking->total_points,
                'average_points' => (float) $ranking->average_points,
                'top_finishes' => $ranking->top_finishes,
                'top_rate' => (float) $ranking->top_rate,
            ])
            ->values();

        $rankingsTotal = $players
            ->sortByDesc('total_points')
            ->values();
        $rankingsAverage = $players
            ->sortByDesc('average_points')
            ->values();
        $rankingsTopRate = $players
            ->sortByDesc('top_rate')
            ->values();

        $players = $players->map(function ($player) use ($rankingsTotal, $rankingsAverage, $rankingsTopRate) {
            $player['rankings'] = [];

            $totalRank = $rankingsTotal->search(fn ($p) => $p['id'] === $player['id']);
            $averageRank = $rankingsAverage->search(fn ($p) => $p['id'] === $player['id']);
            $topRateRank = $rankingsTopRate->search(fn ($p) => $p['id'] === $player['id']);

            if ($totalRank !== false && $totalRank < 3) {
                $player['rankings'][] = [
                    'label' => '累計',
                    'value' => '第'.($totalRank + 1).'位',
                ];
            }

            if ($averageRank !== false && $averageRank < 3) {
                $player['rankings'][] = [
                    'label' => '平均',
                    'value' => '第'.($averageRank + 1).'位',
                ];
            }

            if ($topRateRank !== false && $topRateRank < 3) {
                $player['rankings'][] = [
                    'label' => 'トップ率',
                    'value' => '第'.($topRateRank + 1).'位',
                ];
            }

            return $player;
        });

        return Inertia::render('rankings/index', [
            'players' => $players,
            'period' => $period,
        ]);
    }
}
