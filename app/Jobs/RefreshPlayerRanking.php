<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\RankingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUniqueUntilProcessing;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RefreshPlayerRanking implements ShouldBeUniqueUntilProcessing, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $timeout = 120;

    /**
     * @param  array<int, string>|null  $periods
     */
    public function __construct(
        public readonly int $userId,
        public readonly ?array $periods = null,
    ) {}

    public function uniqueId(): string
    {
        return 'player-ranking:'.$this->userId.':'.implode(',', $this->periods ?? RankingService::PERIODS);
    }

    public function handle(RankingService $rankingService): void
    {
        $user = User::find($this->userId);

        if ($user) {
            $rankingService->updateForUser($user, $this->periods);
        }
    }
}
