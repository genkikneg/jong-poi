<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('player_rankings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('period');
            $table->decimal('total_points', 12, 2);
            $table->decimal('average_points', 12, 2);
            $table->decimal('top_rate', 5, 4);
            $table->unsignedInteger('games_played');
            $table->unsignedInteger('top_finishes');
            $table->json('stats');
            $table->timestamps();

            $table->unique(['user_id', 'period']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('player_rankings');
    }
};
