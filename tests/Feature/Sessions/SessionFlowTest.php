<?php

namespace Tests\Feature\Sessions;

use App\Models\Friendship;
use App\Models\Session;
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
                ['user_id' => $friendB->id, 'final_score' => 20000, 'rank' => 3],
                ['user_id' => $friendC->id, 'final_score' => 18000, 'rank' => 4],
            ],
        ];

        $this->actingAs($host)
            ->post(route('sessions.games.store', $session), $payload)
            ->assertRedirect();

        $this->assertDatabaseCount('game_results', 4);

        $this->actingAs($friendA)
            ->get(route('sessions.history'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('sessions/history')
                ->where('results.0.session.name', '夜会')
            );
    }

    protected function makeFriends(User $a, User $b): void
    {
        Friendship::create(['user_id' => $a->id, 'friend_id' => $b->id]);
        Friendship::create(['user_id' => $b->id, 'friend_id' => $a->id]);
    }
}
