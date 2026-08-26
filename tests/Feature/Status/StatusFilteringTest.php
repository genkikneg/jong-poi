<?php

namespace Tests\Feature\Status;

use App\Enums\SessionStatus;
use App\Models\Game;
use App\Models\GameResult;
use App\Models\Session;
use App\Models\SessionMember;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class StatusFilteringTest extends TestCase
{
    use RefreshDatabase;

    public function test_status_only_aggregates_closed_sessions_and_filters_player_count(): void
    {
        $user = User::factory()->create();
        $this->resultFor($user, 4, SessionStatus::Closed, 120);
        $this->resultFor($user, 3, SessionStatus::Closed, -20);
        $this->resultFor($user, 4, SessionStatus::Open, 999);

        $this->actingAs($user)->get(route('status', ['player_count' => 4]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('status/index')
                ->where('summary.total_games', 1)
                ->where('summary.total_points', '120')
                ->where('filters.player_count', 4)
                ->has('trend', 1));
    }

    public function test_history_only_lists_closed_sessions(): void
    {
        $user = User::factory()->create();
        $closed = $this->resultFor($user, 4, SessionStatus::Closed, 50);
        $this->resultFor($user, 4, SessionStatus::Open, 100);

        $this->actingAs($user)->get(route('sessions.history'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('sessions/history')
                ->where('sessions.total', 1)
                ->where('sessions.data.0.id', $closed->id));
    }

    private function resultFor(User $user, int $playerCount, SessionStatus $status, float $points): Session
    {
        $session = Session::create([
            'owner_id' => $user->id,
            'name' => "{$playerCount}人卓",
            'player_count' => $playerCount,
            'status' => $status,
            'rule_base' => 25000,
            'rule_k' => 0.1,
            'rule_rank_bonus' => [],
            'rules_snapshot' => [],
            'closed_at' => $status === SessionStatus::Closed ? now() : null,
        ]);
        SessionMember::create(['session_id' => $session->id, 'user_id' => $user->id, 'is_host' => true, 'seat_index' => 0, 'joined_at' => now()]);
        $game = Game::create(['session_id' => $session->id, 'created_by' => $user->id, 'ordinal' => 1, 'played_at' => now()]);
        GameResult::create([
            'game_id' => $game->id, 'session_id' => $session->id, 'user_id' => $user->id,
            'final_score' => 25000, 'rank' => 1, 'points' => $points,
            'score_diff' => 0, 'score_diff_scaled' => 0, 'rank_bonus' => $points,
        ]);

        return $session;
    }
}
