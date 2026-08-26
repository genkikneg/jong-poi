<?php

namespace Tests\Feature\Sessions;

use App\Models\Friendship;
use App\Models\Session;
use App\Models\SessionGameDraft;
use App\Models\SessionGameDraftEntry;
use App\Models\SessionMember;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SessionFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_session_with_friends(): void
    {
        $host = User::factory()->create();
        $friendA = User::factory()->create();
        $friendB = User::factory()->create();
        $friendC = User::factory()->create();

        $this->makeFriends($host, $friendA);
        $this->makeFriends($host, $friendB);
        $this->makeFriends($host, $friendC);

        $response = $this->actingAs($host)->post(route('sessions.store'), [
            'name' => 'テスト卓',
            'player_count' => 4,
            'member_ids' => [$friendA->id, $friendB->id, $friendC->id],
            'rules' => [
                'base' => 25000,
                'k' => 0.1,
                'rank_bonus' => [1 => 2000, 2 => 1000, 3 => 0, 4 => -3000],
            ],
        ]);

        $response->assertRedirect();

        $session = Session::first();
        $this->assertNotNull($session);
        $this->assertEquals('テスト卓', $session->name);
        $this->assertDatabaseCount('session_members', 4);
    }

    public function test_member_can_join_and_record_game(): void
    {
        $host = User::factory()->create();
        $friendA = User::factory()->create();
        $friendB = User::factory()->create();
        $friendC = User::factory()->create();

        $this->makeFriends($host, $friendA);
        $this->makeFriends($host, $friendB);
        $this->makeFriends($host, $friendC);

        $this->actingAs($host)->post(route('sessions.store'), [
            'name' => '夜会',
            'player_count' => 4,
            'member_ids' => [$friendA->id, $friendB->id, $friendC->id],
            'rules' => [
                'base' => 25000,
                'k' => 0.1,
                'rank_bonus' => [1 => 2000, 2 => 1000, 3 => 0, 4 => -3000],
            ],
        ]);

        $session = Session::firstOrFail();

        $this->actingAs($friendA)
            ->post(route('sessions.join'), [
                'join_code' => $session->join_code,
            ])
            ->assertRedirect();

        $payload = [
            'played_at' => now()->format('Y-m-d\TH:i'),
            'results' => [
                ['user_id' => $host->id, 'final_score' => 32000, 'rank' => 1],
                ['user_id' => $friendA->id, 'final_score' => 28000, 'rank' => 2],
                ['user_id' => $friendB->id, 'final_score' => 22000, 'rank' => 3],
                ['user_id' => $friendC->id, 'final_score' => 18000, 'rank' => 4],
            ],
        ];

        $this->actingAs($host)
            ->post(route('sessions.games.store', $session), $payload)
            ->assertRedirect();

        $this->assertDatabaseCount('game_results', 4);

        $session->markClosed();

        $this->actingAs($friendA)
            ->get(route('sessions.history'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('sessions/history')
                ->where('sessions.data.0.name', '夜会')
            );
    }

    public function test_game_results_require_each_member_exactly_once(): void
    {
        [$session, $players] = $this->createSessionWithPlayers();

        $response = $this->actingAs($players[0])->post(route('sessions.games.store', $session), [
            'results' => [
                ['user_id' => $players[0]->id, 'final_score' => 40000, 'rank' => 1],
                ['user_id' => $players[0]->id, 'final_score' => 30000, 'rank' => 2],
                ['user_id' => $players[1]->id, 'final_score' => 20000, 'rank' => 3],
                ['user_id' => $players[2]->id, 'final_score' => 10000, 'rank' => 4],
            ],
        ]);

        $response->assertSessionHasErrors(['results.1.user_id']);
        $this->assertDatabaseCount('games', 0);
    }

    public function test_game_results_must_match_the_expected_total(): void
    {
        [$session, $players] = $this->createSessionWithPlayers();

        $response = $this->actingAs($players[0])->post(route('sessions.games.store', $session), [
            'results' => $this->resultsFor($players, [40000, 30000, 20000, 20000]),
        ]);

        $response->assertSessionHasErrors(['results']);
        $this->assertDatabaseCount('games', 0);
    }

    public function test_game_result_ranks_must_match_score_order(): void
    {
        [$session, $players] = $this->createSessionWithPlayers();
        $results = $this->resultsFor($players, [40000, 30000, 20000, 10000]);
        $results[0]['rank'] = 2;
        $results[1]['rank'] = 1;

        $response = $this->actingAs($players[0])->post(route('sessions.games.store', $session), [
            'results' => $results,
        ]);

        $response->assertSessionHasErrors(['results']);
        $this->assertDatabaseCount('games', 0);
    }

    public function test_three_player_game_rejects_fourth_place(): void
    {
        [$session, $players] = $this->createSessionWithPlayers(3);
        $results = $this->resultsFor($players, [35000, 25000, 15000]);
        $results[2]['rank'] = 4;

        $response = $this->actingAs($players[0])->post(route('sessions.games.store', $session), [
            'results' => $results,
        ]);

        $response->assertSessionHasErrors(['results.2.rank']);
        $this->assertDatabaseCount('games', 0);
    }

    public function test_invalid_draft_cannot_be_confirmed(): void
    {
        [$session, $players] = $this->createSessionWithPlayers();
        $draft = SessionGameDraft::create([
            'session_id' => $session->id,
            'created_by' => $players[0]->id,
        ]);

        foreach ($this->resultsFor($players, [40000, 30000, 20000, 20000]) as $result) {
            SessionGameDraftEntry::create([
                'draft_id' => $draft->id,
                'session_id' => $session->id,
                ...$result,
            ]);
        }

        $response = $this->actingAs($players[0])
            ->post(route('sessions.draft.confirm', $session));

        $response->assertSessionHasErrors(['draft']);
        $this->assertDatabaseCount('games', 0);
        $this->assertDatabaseHas('session_game_drafts', ['id' => $draft->id]);
    }

    public function test_multiple_members_submit_to_the_same_draft(): void
    {
        [$session, $players] = $this->createSessionWithPlayers();

        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class)
            ->actingAs($players[0])
            ->post(route('sessions.draft.store', $session), [
                'final_score' => 32000,
                'rank' => 1,
            ])
            ->assertRedirect(route('sessions.show', $session));

        $this->actingAs($players[1])
            ->post(route('sessions.draft.store', $session), [
                'final_score' => 28000,
                'rank' => 2,
            ])
            ->assertRedirect(route('sessions.show', $session));

        $this->assertDatabaseCount('session_game_drafts', 1);
        $this->assertDatabaseCount('session_game_draft_entries', 2);
    }

    public function test_confirming_the_same_draft_twice_creates_one_game(): void
    {
        [$session, $players] = $this->createSessionWithPlayers();
        $draft = SessionGameDraft::create([
            'session_id' => $session->id,
            'created_by' => $players[0]->id,
        ]);

        foreach ($this->resultsFor($players, [40000, 30000, 20000, 10000]) as $result) {
            SessionGameDraftEntry::create([
                'draft_id' => $draft->id,
                'session_id' => $session->id,
                ...$result,
            ]);
        }

        $this->actingAs($players[0])
            ->post(route('sessions.draft.confirm', $session))
            ->assertRedirect(route('sessions.show', $session));

        $this->actingAs($players[0])
            ->post(route('sessions.draft.confirm', $session))
            ->assertSessionHasErrors(['draft']);

        $this->assertDatabaseCount('games', 1);
        $this->assertDatabaseCount('game_results', 4);
    }

    /**
     * @return array{Session, array<int, User>}
     */
    protected function createSessionWithPlayers(int $playerCount = 4): array
    {
        $players = User::factory()->count($playerCount)->create()->all();
        $session = Session::create([
            'owner_id' => $players[0]->id,
            'name' => '検証卓',
            'player_count' => $playerCount,
            'rules_snapshot' => [
                'base' => 25000,
                'k' => 0.1,
                'rank_bonus' => [1 => 2000, 2 => 1000, 3 => 0, 4 => -3000],
            ],
            'rule_base' => 25000,
            'rule_k' => 0.1,
            'rule_rank_bonus' => [1 => 2000, 2 => 1000, 3 => 0, 4 => -3000],
        ]);

        foreach ($players as $index => $player) {
            SessionMember::create([
                'session_id' => $session->id,
                'user_id' => $player->id,
                'is_host' => $index === 0,
                'seat_index' => $index,
                'joined_at' => now(),
            ]);
        }

        return [$session, $players];
    }

    /**
     * @param  array<int, User>  $players
     * @param  array<int, int>  $scores
     * @return array<int, array{user_id:int, final_score:int, rank:int}>
     */
    protected function resultsFor(array $players, array $scores): array
    {
        return collect($players)->map(fn (User $player, int $index) => [
            'user_id' => $player->id,
            'final_score' => $scores[$index],
            'rank' => $index + 1,
        ])->all();
    }

    protected function makeFriends(User $a, User $b): void
    {
        Friendship::create(['user_id' => $a->id, 'friend_id' => $b->id]);
        Friendship::create(['user_id' => $b->id, 'friend_id' => $a->id]);
    }
}
