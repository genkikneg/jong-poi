<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('friend_code', 12)
                ->nullable()
                ->unique()
                ->after('email_verified_at');
        });

        User::query()
            ->whereNull('friend_code')
            ->each(function (User $user) {
                $user->forceFill([
                    'friend_code' => User::generateFriendCode(),
                ])->save();
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique('users_friend_code_unique');
            $table->dropColumn('friend_code');
        });
    }
};
