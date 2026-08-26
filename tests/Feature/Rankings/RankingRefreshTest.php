<?php

namespace Tests\Feature\Rankings;

use App\Enums\SessionStatus;
use App\Jobs\RefreshPlayerRanking;
use App\Models\Game;
use App\Models\GameResult;
use App\Models\Session;
use App\Models\SessionMember;
use App\Models\User;
use App\Services\RankingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RankingRefreshTest extends TestCase
{
    use RefreshDatabase;

    public function test_closing_a_session_queues_one_refresh_per_member(): void
    {
        Queue::fake();

        $host = User::factory()->create();
        $member = User::factory()->create();
        $session = $this->createSession($host, SessionStatus::Open);
        $this->addMember($session, $member, 1);

        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class)
            ->actingAs($host)
            ->patch(route('sessions.close', $session))
            ->assertRedirect(route('sessions.show', $session));

        Queue::assertPushed(RefreshPlayerRanking::class, 2);
        Queue::assertPushed(RefreshPlayerRanking::class, fn (RefreshPlayerRanking $job) => $job->userId === $host->id);
        Queue::assertPushed(RefreshPlayerRanking::class, fn (RefreshPlayerRanking $job) => $job->userId === $member->id);
    }

    public function test_rankings_include_only_closed_sessions_and_use_played_at_for_periods(): void
    {
        $player = User::factory()->create();
        $closedSession = $this->createSession($player, SessionStatus::Closed);
        $openSession = $this->createSession($player, SessionStatus::Open);

        foreach (range(1, 5) as $ordinal) {
            $game = Game::create([
                'session_id' => $closedSession->id,
                'created_by' => $player->id,
                'ordinal' => $ordinal,
                'played_at' => $ordinal === 1 ? now()->startOfYear()->subDay() : now(),
            ]);

            GameResult::create([
                'game_id' => $game->id,
                'session_id' => $closedSession->id,
                'user_id' => $player->id,
                'final_score' => 25000,
                'rank' => 1,
                'points' => 100,
                'score_diff' => 0,
                'score_diff_scaled' => 0,
                'rank_bonus' => 100,
            ]);
        }

        $openGame = Game::create([
            'session_id' => $openSession->id,
            'created_by' => $player->id,
            'ordinal' => 1,
            'played_at' => now(),
        ]);
        GameResult::create([
            'game_id' => $openGame->id,
            'session_id' => $openSession->id,
            'user_id' => $player->id,
            'final_score' => 25000,
            'rank' => 1,
            'points' => 9999,
            'score_diff' => 0,
            'score_diff_scaled' => 0,
            'rank_bonus' => 9999,
        ]);

        app(RankingService::class)->updateForUser($player);

        $this->assertDatabaseHas('player_rankings', [
            'user_id' => $player->id,
            'period' => 'all',
            'games_played' => 5,
            'total_points' => 500,
        ]);
        $this->assertDatabaseMissing('player_rankings', [
            'user_id' => $player->id,
            'period' => 'year',
        ]);
    }

    public function test_week_is_not_an_available_ranking_period(): void
    {
        $this->artisan('rankings:rebuild --period=week')
            ->expectsOutput('Invalid ranking period: week')
            ->assertExitCode(2);

        $this->actingAs(User::factory()->create())
            ->get(route('rankings', ['period' => 'week']))
            ->assertInertia(fn (Assert $page) => $page->where('period', 'all'));
    }

    private function createSession(User $owner, SessionStatus $status): Session
    {
        $session = Session::create([
            'owner_id' => $owner->id,
            'name' => 'ランキング検証卓',
            'player_count' => 2,
            'status' => $status,
            'rules_snapshot' => ['base' => 25000, 'k' => 0.1, 'rank_bonus' => [1 => 20, 2 => -20]],
            'rule_base' => 25000,
            'rule_k' => 0.1,
            'rule_rank_bonus' => [1 => 20, 2 => -20],
        ]);

        $this->addMember($session, $owner, 0, true);

        return $session;
    }

    private function addMember(Session $session, User $user, int $seatIndex, bool $isHost = false): void
    {
        SessionMember::create([
            'session_id' => $session->id,
            'user_id' => $user->id,
            'is_host' => $isHost,
            'seat_index' => $seatIndex,
            'joined_at' => now(),
        ]);
    }
}
