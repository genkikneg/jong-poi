<?php

use App\Http\Controllers\Friends\FriendController;
use App\Http\Controllers\Friends\FriendRequestController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('friends', [FriendController::class, 'index'])->name('friends.index');

    Route::post('friend-requests', [FriendRequestController::class, 'store'])->name('friend-requests.store');
    Route::patch('friend-requests/{friendRequest}/accept', [FriendRequestController::class, 'accept'])
        ->name('friend-requests.accept');
    Route::delete('friend-requests/{friendRequest}', [FriendRequestController::class, 'destroy'])
        ->name('friend-requests.destroy');
});
