<?php

use App\Http\Controllers\Operations\OperationsController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('user-password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance.edit');

    Route::middleware('operations.admin')->group(function () {
        Route::get('settings/operations', [OperationsController::class, 'index'])->name('operations.index');
        Route::post('settings/operations/verify', [OperationsController::class, 'verify'])
            ->middleware('throttle:6,1')
            ->name('operations.verify');

        Route::middleware('operations.verified')->group(function () {
            Route::get('settings/operations/users', [OperationsController::class, 'users'])->name('operations.users.index');
            Route::get('settings/operations/sessions', [OperationsController::class, 'sessions'])->name('operations.sessions.index');
            Route::post('settings/operations/sessions/{session}/open', [OperationsController::class, 'openSession'])
                ->middleware('throttle:6,1')
                ->name('operations.sessions.open');
            Route::middleware('operations.session.verified')->group(function () {
                Route::get('settings/operations/sessions/{session}', [OperationsController::class, 'showSession'])->name('operations.sessions.show');
                Route::patch('settings/operations/games/{game}', [OperationsController::class, 'correctGame'])
                    ->middleware('throttle:6,1')
                    ->name('operations.games.update');
            });
            Route::get('settings/operations/audits', [OperationsController::class, 'audits'])->name('operations.audits.index');
            Route::post('settings/operations/users/{user}/recovery-code', [OperationsController::class, 'issueRecoveryCode'])
                ->middleware('throttle:6,1')
                ->name('operations.recovery-code.store');
        });
    });

});
