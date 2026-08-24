<?php

namespace Database\Seeders;

use App\Models\Friendship;
use App\Models\Game;
use App\Models\GameResult;
use App\Models\Session;
use App\Models\SessionMember;
use App\Models\User;
use App\Services\PointsCalculator;
use Illuminate\Database\Seeder;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $players = User::factory()->createMany([
            [
                'name' => '太郎',
                'email' => 'test1@test.com',
                'password' => 'test1234',
            ],
            [
                'name' => '二郎',
                'email' => 'test2@test.com',
                'password' => 'test1234',
            ],
            [
                'name' => '三郎',
                'email' => 'test3@test.com',
                'password' => 'test1234',
            ],
            [
                'name' => '四郎',
                'email' => 'test4@test.com',
                'password' => 'test1234',
            ],
        ]);

        $players->each(function (User $player) use ($players): void {
            $players
                ->reject(fn (User $other) => $other->is($player))
                ->each(function (User $other) use ($player): void {
                    Friendship::create([
                        'user_id' => $player->id,
                        'friend_id' => $other->id,
                    ]);
                });
        });

        $session = Session::create([
            'owner_id' => $players->first()->id,
            'name' => '初期対局',
            'player_count' => 4,
            'rules_snapshot' => [
                'base' => 25000,
                'k' => 0.1,
                'rank_bonus' => [1 => 2000, 2 => 1000, 3 => 0, 4 => -3000],
            ],
            'rule_base' => 25000,
            'rule_k' => 0.1,
            'rule_rank_bonus' => [1 => 2000, 2 => 1000, 3 => 0, 4 => -3000],
        ]);

        $players->values()->each(function (User $player, int $seat) use ($session): void {
            SessionMember::create([
                'session_id' => $session->id,
                'user_id' => $player->id,
                'is_host' => $seat === 0,
                'seat_index' => $seat,
                'joined_at' => now(),
            ]);
        });

        $scoresByGame = [
            [40000, 30000, 20000, 10000],
            [35000, 25000, 22000, 18000],
            [30000, 28000, 24000, 18000],
            [20000, 26000, 30000, 24000],
            [18000, 22000, 28000, 42000],
            [32000, 21000, 27000, 20000],
        ];

        DB::transaction(function () use ($session, $players, $scoresByGame): void {
            $calculator = new PointsCalculator($session);

            foreach ($scoresByGame as $gameIndex => $scores) {
                $game = Game::create([
                    'session_id' => $session->id,
                    'created_by' => $players->first()->id,
                    'ordinal' => $gameIndex + 1,
                    'played_at' => now()->subDays(count($scoresByGame) - $gameIndex),
                ]);

                $results = $calculator->calculate(
                    $players->values()->map(fn (User $player, int $seat) => [
                        'user_id' => $player->id,
                        'final_score' => $scores[$seat],
                        'rank' => null,
                    ])->all()
                );

                GameResult::withoutEvents(function () use ($game, $session, $results): void {
                    foreach ($results as $result) {
                        GameResult::create([
                            'game_id' => $game->id,
                            'session_id' => $session->id,
                            'user_id' => $result['user_id'],
                            'final_score' => $result['final_score'],
                            'rank' => $result['rank'],
                            'points' => $result['points'],
                            'score_diff' => $result['score_diff'],
                            'score_diff_scaled' => $result['score_diff_scaled'],
                            'rank_bonus' => $result['rank_bonus'],
                        ]);
                    }
                });
            }
        });

        $this->call(RerankPlayersSeeder::class);
    }
}
