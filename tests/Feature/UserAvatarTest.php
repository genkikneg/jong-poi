<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class UserAvatarTest extends TestCase
{
    use RefreshDatabase;

    public function test_users_receive_unique_opaque_avatar_identifiers(): void
    {
        $users = User::factory()->count(2)->create();

        $this->assertTrue(Str::isUuid($users[0]->avatar_public_id));
        $this->assertTrue(Str::isUuid($users[1]->avatar_public_id));
        $this->assertNotSame($users[0]->avatar_public_id, $users[1]->avatar_public_id);
    }

    public function test_default_avatar_does_not_use_a_user_id_derived_url(): void
    {
        $user = User::factory()->create(['user_id' => 'private_user']);

        $this->assertNull($user->avatar);
    }

    public function test_guest_cannot_distinguish_existing_and_unknown_avatar_identifiers(): void
    {
        $user = User::factory()->create();
        $unknownId = (string) Str::uuid();

        $existing = $this->get(route('avatars.show', ['avatarId' => $user->avatar_public_id]));
        $unknown = $this->get(route('avatars.show', ['avatarId' => $unknownId]));

        $existing->assertRedirect(route('login'));
        $unknown->assertRedirect(route('login'));
        $this->assertSame($existing->getStatusCode(), $unknown->getStatusCode());
        $this->assertSame($existing->headers->get('Location'), $unknown->headers->get('Location'));
    }

    public function test_authenticated_user_can_fetch_a_custom_avatar_by_opaque_identifier(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('avatars/user.png', 'avatar-image');

        $owner = User::factory()->create(['avatar_path' => 'avatars/user.png']);
        $viewer = User::factory()->create();

        $this->assertStringContainsString($owner->avatar_public_id, $owner->avatar);
        $this->assertStringNotContainsString(md5(strtolower($owner->user_id)), $owner->avatar);

        $this->actingAs($viewer)
            ->get($owner->avatar)
            ->assertOk()
            ->assertContent('avatar-image');
    }

    public function test_sequential_database_id_is_not_an_avatar_route_key(): void
    {
        $owner = User::factory()->create();
        $viewer = User::factory()->create();

        $this->actingAs($viewer)
            ->get('/avatars/'.$owner->id)
            ->assertNotFound();
    }
}
