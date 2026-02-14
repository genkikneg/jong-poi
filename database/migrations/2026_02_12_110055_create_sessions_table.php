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
        Schema::create('mahjong_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->string('name')->nullable();
            $table->unsignedTinyInteger('player_count'); // 3 or 4
            $table->string('status', 20)->default('open');
            $table->string('join_code', 10)->unique();
            $table->json('rules_snapshot');
            $table->decimal('rule_base', 10, 1);
            $table->decimal('rule_k', 8, 4);
            $table->json('rule_rank_bonus');
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'player_count']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mahjong_sessions');
    }
};
