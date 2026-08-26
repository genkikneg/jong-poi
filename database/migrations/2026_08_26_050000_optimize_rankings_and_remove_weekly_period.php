<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('player_rankings')->where('period', 'week')->delete();

        Schema::table('game_results', function (Blueprint $table) {
            $table->index(['user_id', 'created_at']);
        });

        Schema::table('games', function (Blueprint $table) {
            $table->index(['played_at', 'id']);
        });

        Schema::table('player_rankings', function (Blueprint $table) {
            $table->index(['period', 'total_points']);
            $table->index(['period', 'average_points']);
            $table->index(['period', 'top_rate']);
        });
    }

    public function down(): void
    {
        Schema::table('player_rankings', function (Blueprint $table) {
            $table->dropIndex(['period', 'total_points']);
            $table->dropIndex(['period', 'average_points']);
            $table->dropIndex(['period', 'top_rate']);
        });

        Schema::table('games', function (Blueprint $table) {
            $table->dropIndex(['played_at', 'id']);
        });

        Schema::table('game_results', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'created_at']);
        });
    }
};
