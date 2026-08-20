<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->uuid('avatar_public_id')
                ->nullable()
                ->unique()
                ->after('id');
        });

        foreach (DB::table('users')->select('id')->lazyById() as $user) {
            DB::table('users')
                ->where('id', $user->id)
                ->update(['avatar_public_id' => (string) Str::uuid()]);
        }

        Schema::table('users', function (Blueprint $table) {
            $table->uuid('avatar_public_id')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique('users_avatar_public_id_unique');
            $table->dropColumn('avatar_public_id');
        });
    }
};
