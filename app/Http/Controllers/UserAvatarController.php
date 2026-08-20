<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class UserAvatarController extends Controller
{
    public function __invoke(string $avatarId): Response
    {
        $user = User::query()
            ->where('avatar_public_id', $avatarId)
            ->firstOrFail(['avatar_path']);

        abort_unless(
            $user->avatar_path && Storage::disk('public')->exists($user->avatar_path),
            404,
        );

        $mime = Storage::disk('public')->mimeType($user->avatar_path) ?? 'image/png';

        return response(
            Storage::disk('public')->get($user->avatar_path),
            200,
            [
                'Cache-Control' => 'private, max-age=300',
                'Content-Type' => $mime,
                'X-Content-Type-Options' => 'nosniff',
            ],
        );
    }
}
