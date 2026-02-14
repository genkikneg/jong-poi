<?php

namespace Database\Factories;

use App\Enums\FriendRequestStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\FriendRequest>
 */
class FriendRequestFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'sender_id' => User::factory(),
            'recipient_id' => User::factory(),
            'status' => FriendRequestStatus::Pending,
        ];
    }

    public function accepted(): static
    {
        return $this->state(fn () => [
            'status' => FriendRequestStatus::Accepted,
        ]);
    }

    public function declined(): static
    {
        return $this->state(fn () => [
            'status' => FriendRequestStatus::Declined,
        ]);
    }
}
