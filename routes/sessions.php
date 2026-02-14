<?php

use App\Http\Controllers\Sessions\GameController;
use App\Http\Controllers\Sessions\SessionController;
use App\Http\Controllers\Sessions\SessionGameDraftController;
use App\Http\Controllers\Sessions\SessionJoinController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('sessions', [SessionController::class, 'store'])->name('sessions.store');
    Route::get('sessions/{session}', [SessionController::class, 'show'])->name('sessions.show');
    Route::patch('sessions/{session}/close', [SessionController::class, 'close'])->name('sessions.close');

    Route::post('sessions/join', [SessionJoinController::class, 'store'])->name('sessions.join');

    Route::post('sessions/{session}/draft', [SessionGameDraftController::class, 'store'])->name('sessions.draft.store');
    Route::post('sessions/{session}/draft/confirm', [SessionGameDraftController::class, 'confirm'])->name('sessions.draft.confirm');

    Route::post('sessions/{session}/games', [GameController::class, 'store'])->name('sessions.games.store');
});
