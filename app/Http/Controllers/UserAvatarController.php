<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class UserAvatarController extends Controller
{
    public function __invoke(User $user): Response|RedirectResponse
    {
        if ($user->avatar_path && Storage::disk('public')->exists($user->avatar_path)) {
            $mime = Storage::disk('public')->mimeType($user->avatar_path) ?? 'image/png';

            return response(
                Storage::disk('public')->get($user->avatar_path),
                200,
                ['Content-Type' => $mime]
            );
        }

        $hash = md5(strtolower(trim($user->email ?? $user->name ?? 'user')));

        return redirect()->away(sprintf('https://www.gravatar.com/avatar/%s?s=180&d=identicon', $hash));
    }
}
