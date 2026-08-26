<?php

namespace Tests\Feature\Operations;

use App\Models\Game;
use App\Models\GameResult;
use App\Models\OperationAudit;
use App\Models\Session;
use App\Models\SessionMember;
use App\Models\User;
use App\Models\UserRecoveryCode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class OperationsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config()->set('operations.admin_user_ids', ['admin', 'misooon']);
        config()->set('operations.password', 'operations-secret');
        config()->set('session.driver', 'array');
        $this->app['session']->forgetDrivers();
    }

    public function test_only_configured_administrators_can_open_operations_tools(): void
    {
        $user = User::factory()->create(['user_id' => 'jongpoi_taro']);

        $this->actingAs($user)
            ->get(route('operations.index'))
            ->assertNotFound();
    }

    public function test_administrator_can_enable_operations_mode_with_operations_password(): void
    {
        $admin = User::factory()->create(['user_id' => 'admin']);

        $this->actingAs($admin)
            ->post(route('operations.verify'), ['operations_password' => 'operations-secret'])
            ->assertRedirect()
            ->assertSessionHas('operations.verified_until');
    }

    public function test_administrator_can_search_users_and_sessions(): void
    {
        $admin = User::factory()->create(['user_id' => 'admin']);
        $user = User::factory()->create(['name' => '検索対象', 'user_id' => 'search_target']);
        $session = Session::create([
            'owner_id' => $admin->id,
            'name' => '検索用対局',
            'player_count' => 2,
            'rules_snapshot' => ['base' => 25000, 'k' => 0.1, 'rank_bonus' => [1 => 20, 2 => -20]],
            'rule_base' => 25000,
            'rule_k' => 0.1,
            'rule_rank_bonus' => [1 => 20, 2 => -20],
        ]);
        SessionMember::create([
            'session_id' => $session->id,
            'user_id' => $user->id,
            'is_host' => false,
            'seat_index' => 0,
            'joined_at' => now(),
        ]);
        Game::create([
            'session_id' => $session->id,
            'created_by' => $admin->id,
            'ordinal' => 1,
            'played_at' => now(),
        ]);

        $this->actingAs($admin)
            ->post(route('operations.verify'), ['operations_password' => 'operations-secret']);

        $this->get(route('operations.users.index', [
            'q' => 'search_target',
            'sort' => 'user_id',
            'direction' => 'asc',
        ]))
            ->assertInertia(fn (Assert $page) => $page
                ->component('settings/operations/users')
                ->where('users.data.0.id', $user->id)
                ->where('sort', 'user_id')
                ->where('direction', 'asc')
            );

        $this->get(route('operations.sessions.index', [
            'q' => '検索用',
            'member_user_id' => 'search_target',
            'played_from' => now()->toDateString(),
            'played_to' => now()->toDateString(),
            'sort' => 'played_at',
            'direction' => 'desc',
        ]))
            ->assertInertia(fn (Assert $page) => $page
                ->component('settings/operations/sessions')
                ->where('sessions.data.0.id', $session->id)
                ->where('selectedUser.user_id', 'search_target')
                ->where('sort', 'played_at')
                ->where('direction', 'desc')
            );
    }

    public function test_expired_operations_mode_returns_to_operations_top(): void
    {
        $admin = User::factory()->create(['user_id' => 'admin']);

        $this->actingAs($admin)
            ->withSession(['operations.verified_until' => now()->subMinute()->toIso8601String()])
            ->get(route('operations.sessions.index'))
            ->assertRedirect(route('operations.index'))
            ->assertSessionHas('status', '運営モードの有効時間が過ぎました。もう一度有効にしてください。');
    }

    public function test_administrator_can_issue_one_time_recovery_code(): void
    {
        $admin = User::factory()->create(['user_id' => 'admin']);
        $user = User::factory()->create(['user_id' => 'locked_user']);

        $this->actingAs($admin)
            ->post(route('operations.verify'), ['operations_password' => 'operations-secret']);

        $this->post(route('operations.recovery-code.store', $user), [
            'operations_password' => 'operations-secret',
        ])
            ->assertRedirect()
            ->assertSessionHas('recovery_code');

        $this->assertDatabaseHas('user_recovery_codes', [
            'user_id' => $user->id,
            'issued_by' => $admin->id,
        ]);
        $this->assertDatabaseHas('operation_audits', [
            'actor_id' => $admin->id,
            'action' => 'recovery_code_issued',
            'target_type' => 'user',
            'target_id' => $user->id,
        ]);
    }

    public function test_recovery_code_resets_password_and_user_id_and_logs_user_in(): void
    {
        $admin = User::factory()->create(['user_id' => 'admin']);
        $user = User::factory()->create(['user_id' => 'legacy@example.com']);
        $code = 'A1B2C3D4E5F6';

        UserRecoveryCode::create([
            'user_id' => $user->id,
            'issued_by' => $admin->id,
            'code_hash' => hash_hmac('sha256', $code, config('app.key')),
            'expires_at' => now()->addMinutes(30),
        ]);

        $this->post(route('recovery.verify'), [
            'code' => $code,
        ])->assertRedirect(route('recovery.password.edit'));

        $this->get(route('recovery.password.edit'))
            ->assertInertia(fn (Assert $page) => $page->component('auth/recover-account-password'));

        $this->post(route('recovery.store'), [
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])
            ->assertRedirect(route('dashboard'));

        $user->refresh();
        $this->assertSame('legacy@example.com', $user->user_id);
        $this->assertTrue(Hash::check('new-password', $user->password));
        $this->assertAuthenticatedAs($user);
        $this->assertNotNull(UserRecoveryCode::firstOrFail()->used_at);
        $this->assertDatabaseHas('operation_audits', [
            'actor_id' => $admin->id,
            'action' => 'account_recovered',
            'target_type' => 'user',
            'target_id' => $user->id,
        ]);
    }

    public function test_administrator_can_correct_game_and_an_audit_is_recorded(): void
    {
        $admin = User::factory()->create(['user_id' => 'admin']);
        $player = User::factory()->create(['user_id' => 'player_one']);
        $session = Session::create([
            'owner_id' => $admin->id,
            'name' => '訂正テスト',
            'player_count' => 2,
            'rules_snapshot' => ['base' => 25000, 'k' => 0.1, 'rank_bonus' => [1 => 20, 2 => -20]],
            'rule_base' => 25000,
            'rule_k' => 0.1,
            'rule_rank_bonus' => [1 => 20, 2 => -20],
        ]);
        SessionMember::create(['session_id' => $session->id, 'user_id' => $admin->id, 'is_host' => true, 'seat_index' => 0, 'joined_at' => now()]);
        SessionMember::create(['session_id' => $session->id, 'user_id' => $player->id, 'is_host' => false, 'seat_index' => 1, 'joined_at' => now()]);
        $game = Game::create(['session_id' => $session->id, 'created_by' => $admin->id, 'ordinal' => 1]);
        GameResult::create(['game_id' => $game->id, 'session_id' => $session->id, 'user_id' => $admin->id, 'final_score' => 25000, 'rank' => 1, 'points' => 20, 'score_diff' => 0, 'score_diff_scaled' => 0, 'rank_bonus' => 20]);
        GameResult::create(['game_id' => $game->id, 'session_id' => $session->id, 'user_id' => $player->id, 'final_score' => 25000, 'rank' => 2, 'points' => -20, 'score_diff' => 0, 'score_diff_scaled' => 0, 'rank_bonus' => -20]);

        $this->actingAs($admin)
            ->post(route('operations.verify'), ['operations_password' => 'operations-secret']);

        $this->post(route('operations.sessions.open', $session), [
            'operations_password' => 'operations-secret',
        ])->assertRedirect(route('operations.sessions.show', $session));

        $this->patch(route('operations.games.update', $game), [
            'reason' => '入力ミスの訂正',
            'results' => [
                ['user_id' => $admin->id, 'final_score' => 30000],
                ['user_id' => $player->id, 'final_score' => 20100],
            ],
        ])->assertSessionHasErrors([
            'results' => '点数の合計が一致しません（合計差分: +100点）。',
        ]);

        $this->patch(route('operations.games.update', $game), [
            'reason' => '入力ミスの訂正',
            'results' => [
                ['user_id' => $admin->id, 'final_score' => 30000],
                ['user_id' => $player->id, 'final_score' => 20000],
            ],
        ])->assertRedirect(route('operations.sessions.show', $session));

        $this->assertDatabaseHas('game_results', [
            'game_id' => $game->id,
            'user_id' => $admin->id,
            'final_score' => 30000,
            'rank' => 1,
        ]);
        $this->assertDatabaseHas('operation_audits', [
            'actor_id' => $admin->id,
            'action' => 'game_corrected',
            'target_type' => 'game',
            'target_id' => $game->id,
            'reason' => '入力ミスの訂正',
        ]);
        $this->assertSame(1, OperationAudit::count());
    }
}
