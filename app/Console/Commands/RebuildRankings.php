<?php

namespace App\Console\Commands;

use App\Jobs\RefreshPlayerRanking;
use App\Models\User;
use App\Services\RankingService;
use Illuminate\Console\Command;

class RebuildRankings extends Command
{
    protected $signature = 'rankings:rebuild
                            {--period=* : Rebuild only all, year, or month rankings}
                            {--queue : Dispatch one queued job per player}';

    protected $description = 'Rebuild player rankings from game results';

    public function __construct(private readonly RankingService $rankingService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $periods = array_values(array_unique($this->option('period')));
        $invalidPeriods = array_diff($periods, RankingService::PERIODS);

        if ($invalidPeriods !== []) {
            $this->error('Invalid ranking period: '.implode(', ', $invalidPeriods));

            return self::INVALID;
        }

        $periods = $periods === [] ? RankingService::PERIODS : $periods;
        $queued = (bool) $this->option('queue');

        User::query()->orderBy('id')->chunkById(200, function ($users) use ($periods, $queued) {
            foreach ($users as $user) {
                if ($queued) {
                    RefreshPlayerRanking::dispatch($user->id, $periods);

                    continue;
                }

                $this->rankingService->updateForUser($user, $periods);
            }
        });

        $this->info($queued ? 'Ranking refresh jobs dispatched.' : 'Rankings rebuilt successfully.');

        return self::SUCCESS;
    }
}
