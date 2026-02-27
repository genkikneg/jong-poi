<?php

namespace Database\Seeders;

use App\Models\GameResult;
use App\Services\RankingService;
use Illuminate\Database\Seeder;

class RerankPlayersSeeder extends Seeder
{
    public function __construct(private readonly RankingService $rankingService)
    {
    }

    public function run(): void
    {
        GameResult::query()
            ->select('user_id')
            ->distinct()
            ->pluck('user_id')
            ->each(function ($userId) {
                $user = \App\Models\User::find($userId);

                if ($user) {
                    $this->rankingService->updateForUser($user);
                }
            });
    }
}
