<?php

namespace Tests\Feature\Friends;

use App\Enums\FriendRequestStatus;
use App\Models\FriendRequest;
use App\Models\Friendship;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class FriendRequestTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_send_friend_request(): void
    {
        $sender = User::factory()->create();
        $recipient = User::factory()->create();

        $response = $this->actingAs($sender)->post(route('friend-requests.store'), [
            'friend_code' => $recipient->friend_code,
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('friend_requests', [
            'sender_id' => $sender->id,
            'recipient_id' => $recipient->id,
            'status' => FriendRequestStatus::Pending->value,
        ]);
    }

    public function test_user_cannot_add_themselves(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('friend-requests.store'), [
            'friend_code' => $user->friend_code,
        ]);

        $response->assertSessionHasErrors('friend_code');
        $this->assertDatabaseCount('friend_requests', 0);
    }

    public function test_user_cannot_add_existing_friend(): void
    {
        $user = User::factory()->create();
        $friend = User::factory()->create();

        Friendship::create(['user_id' => $user->id, 'friend_id' => $friend->id]);
        Friendship::create(['user_id' => $friend->id, 'friend_id' => $user->id]);

        $response = $this->actingAs($user)->post(route('friend-requests.store'), [
            'friend_code' => $friend->friend_code,
        ]);

        $response->assertSessionHasErrors('friend_code');
    }

    public function test_recipient_can_accept_friend_request(): void
    {
        $friendRequest = FriendRequest::factory()->create();

        $response = $this->actingAs($friendRequest->recipient)->patch(
            route('friend-requests.accept', $friendRequest),
        );

        $response->assertRedirect();

        $this->assertDatabaseHas('friendships', [
            'user_id' => $friendRequest->recipient_id,
            'friend_id' => $friendRequest->sender_id,
        ]);

        $this->assertDatabaseHas('friendships', [
            'user_id' => $friendRequest->sender_id,
            'friend_id' => $friendRequest->recipient_id,
        ]);

        $friendRequest->refresh();
        $this->assertTrue($friendRequest->status === FriendRequestStatus::Accepted);
    }

    public function test_participants_can_cancel_or_decline(): void
    {
        $friendRequest = FriendRequest::factory()->create();

        $response = $this->actingAs($friendRequest->sender)->delete(
            route('friend-requests.destroy', $friendRequest),
        );

        $response->assertRedirect();

        $friendRequest->refresh();
        $this->assertTrue($friendRequest->status === FriendRequestStatus::Declined);
    }

    public function test_other_users_cannot_modify_friend_requests(): void
    {
        $friendRequest = FriendRequest::factory()->create();
        $stranger = User::factory()->create();

        $this->actingAs($stranger)
            ->patch(route('friend-requests.accept', $friendRequest))
            ->assertForbidden();

        $this->actingAs($stranger)
            ->delete(route('friend-requests.destroy', $friendRequest))
            ->assertForbidden();
    }

    public function test_friends_page_renders_friend_data(): void
    {
        $user = User::factory()->create();
        $incoming = FriendRequest::factory()->create(['recipient_id' => $user->id]);
        $outgoing = FriendRequest::factory()->create(['sender_id' => $user->id]);

        Friendship::create(['user_id' => $user->id, 'friend_id' => $incoming->sender_id]);
        Friendship::create(['user_id' => $incoming->sender_id, 'friend_id' => $user->id]);

        $response = $this->actingAs($user)->get(route('friends.index'));

        $response->assertOk();

        $response->assertInertia(fn (Assert $page) => $page
            ->component('friends/index')
            ->where('friendCode', $user->friend_code)
            ->has('incomingRequests', 1, fn (Assert $assert) => $assert
                ->where('id', $incoming->id)
                ->where('sender.id', $incoming->sender_id)
                ->etc()
            )
            ->has('outgoingRequests', 1, fn (Assert $assert) => $assert
                ->where('id', $outgoing->id)
                ->where('recipient.id', $outgoing->recipient_id)
                ->etc()
            )
        );
    }
}
