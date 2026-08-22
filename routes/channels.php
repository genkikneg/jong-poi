<?php

use App\Models\Session;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('sessions.{session}', function ($user, Session $session) {
    return $session->members()->where('user_id', $user->id)->exists();
});
