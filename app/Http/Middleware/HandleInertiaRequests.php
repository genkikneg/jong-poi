<?php

namespace App\Http\Middleware;

use App\Enums\SessionStatus;
use App\Models\FriendRequest;
use App\Models\SessionMember;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'notifications' => $this->notifications($request),
        ];
    }

    /**
     * @return array<string, int|bool>
     */
    protected function notifications(Request $request): array
    {
        $user = $request->user();

        $defaults = [
            'friendRequests' => 0,
            'sessionInvites' => 0,
            'hasActiveSession' => false,
        ];

        if (! $user) {
            return $defaults;
        }

        $friendRequests = FriendRequest::query()
            ->pending()
            ->where('recipient_id', $user->id)
            ->count();

        $openStatus = SessionStatus::Open->value;

        $sessionInvites = SessionMember::query()
            ->where('user_id', $user->id)
            ->whereNull('joined_at')
            ->whereHas('session', fn ($query) => $query->where('status', $openStatus))
            ->count();

        $hasActiveSession = SessionMember::query()
            ->where('user_id', $user->id)
            ->whereNotNull('joined_at')
            ->whereHas('session', fn ($query) => $query->where('status', $openStatus))
            ->exists();

        return [
            'friendRequests' => $friendRequests,
            'sessionInvites' => $sessionInvites,
            'hasActiveSession' => $hasActiveSession,
        ];
    }
}
