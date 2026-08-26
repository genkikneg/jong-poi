<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'user_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('user_id')->nullable()->after('name');
            });
        }

        if (Schema::hasColumn('users', 'email')) {
            DB::table('users')
                ->whereNull('user_id')
                ->update(['user_id' => DB::raw('LOWER(email)')]);

            Schema::table('users', function (Blueprint $table) {
                $table->unique('user_id');
                $table->string('user_id')->nullable(false)->change();
                $table->dropUnique('users_email_unique');
                $table->dropColumn(['email', 'email_verified_at']);
            });
        }

        Schema::dropIfExists('password_reset_tokens');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable()->after('name');
            $table->timestamp('email_verified_at')->nullable()->after('email');
        });

        DB::table('users')->update(['email' => DB::raw('user_id')]);

        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable(false)->change();
            $table->unique('email');
            $table->dropUnique('users_user_id_unique');
            $table->dropColumn('user_id');
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });
    }
};
