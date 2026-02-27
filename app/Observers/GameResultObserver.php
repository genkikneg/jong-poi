<?php

namespace App\Observers;

use App\Models\GameResult;
use App\Services\RankingService;

class GameResultObserver
{
    public function __construct(private readonly RankingService $rankingService)
    {
    }

    public function created(GameResult $gameResult): void
    {
        $this->rankingService->updateForUser($gameResult->user);
    }

    public function updated(GameResult $gameResult): void
    {
        $this->rankingService->updateForUser($gameResult->user);
    }
}
