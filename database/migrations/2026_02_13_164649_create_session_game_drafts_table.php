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
        Schema::create('session_game_drafts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->unique()->constrained('mahjong_sessions')->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamp('played_at')->nullable();
            $table->timestamps();
        });

        Schema::create('session_game_draft_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('draft_id')->constrained('session_game_drafts')->cascadeOnDelete();
            $table->foreignId('session_id')->constrained('mahjong_sessions')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('final_score', 10, 1);
            $table->unsignedTinyInteger('rank')->nullable();
            $table->timestamps();

            $table->unique(['draft_id', 'user_id']);
            $table->index(['session_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('session_game_draft_entries');
        Schema::dropIfExists('session_game_drafts');
    }
};
