<?php

use App\Enums\SessionStatus;
use App\Http\Controllers\Status\StatusController;
use App\Http\Controllers\Sessions\SessionViewController;
use App\Http\Controllers\UserAvatarController;
use App\Models\Session;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('avatars/{user}', UserAvatarController::class)->name('avatars.show');

Route::middleware(['auth', 'verified'])->group(function () {
    $dashboardHandler = function (Request $request) {
        $activeSession = null;

        if ($request->user()) {
            $session = Session::query()
                ->where('status', SessionStatus::Open->value)
                ->whereHas('members', fn ($query) => $query
                    ->where('user_id', $request->user()->id)
                    ->whereNotNull('joined_at'))
                ->with(['owner:id,name'])
                ->latest('updated_at')
                ->first();

            if ($session) {
                $activeSession = [
                    'id' => $session->id,
                    'name' => $session->name,
                    'owner' => $session->owner?->name,
                    'join_code' => $session->join_code,
                    'player_count' => $session->player_count,
                ];
            }
        }

        return Inertia::render('dashboard', [
            'activeSession' => $activeSession,
        ]);
    };

    Route::get('/', $dashboardHandler)->name('home');

    Route::get('dashboard', $dashboardHandler)->name('dashboard');

    Route::get('status', [StatusController::class, 'index'])
        ->name('status');


    Route::get('sessions/create', [SessionViewController::class, 'create'])
        ->name('sessions.create');
    Route::get('sessions/join', [SessionViewController::class, 'join'])
        ->name('sessions.join.view');
    Route::get('sessions/history', [SessionViewController::class, 'history'])
        ->name('sessions.history');
});

require __DIR__.'/settings.php';
require __DIR__.'/friends.php';
require __DIR__.'/sessions.php';
