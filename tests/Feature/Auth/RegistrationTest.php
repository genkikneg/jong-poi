<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered()
    {
        $response = $this->get(route('register'));

        $response->assertOk();
    }

    public function test_new_users_can_register()
    {
        $response = $this->post(route('register.store'), [
            'name' => 'Test User',
            'user_id' => 'test_user',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
        $this->assertDatabaseHas('users', ['user_id' => 'test_user']);
    }

    public function test_user_id_must_be_unique_ignoring_case(): void
    {
        User::factory()->create(['user_id' => 'test_user']);

        $response = $this->from(route('register'))->post(route('register.store'), [
            'name' => 'Another User',
            'user_id' => 'TEST_USER',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertSessionHasErrors('user_id');
    }
}
