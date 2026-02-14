<?php

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
        Schema::create('game_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_id')->constrained('games')->cascadeOnDelete();
            $table->foreignId('session_id')->constrained('mahjong_sessions')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('final_score', 10, 1);
            $table->unsignedTinyInteger('rank');
            $table->decimal('points', 12, 4);
            $table->decimal('score_diff', 10, 1);
            $table->decimal('score_diff_scaled', 12, 4);
            $table->decimal('rank_bonus', 12, 4);
            $table->timestamps();

            $table->unique(['game_id', 'user_id']);
            $table->index(['session_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('game_results');
    }
};
