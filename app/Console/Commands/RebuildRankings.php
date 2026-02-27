<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\RankingService;
use Illuminate\Console\Command;

class RebuildRankings extends Command
{
    protected $signature = 'rankings:rebuild';

    protected $description = 'Rebuild player rankings from game results';

    public function __construct(private readonly RankingService $rankingService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        User::query()->chunk(200, function ($users) {
            foreach ($users as $user) {
                $this->rankingService->updateForUser($user);
            }
        });

        $this->info('Rankings rebuilt successfully.');

        return self::SUCCESS;
    }
}
