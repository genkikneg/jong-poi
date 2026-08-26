<?php

namespace App\Services;

use App\Models\Session;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class OperationsAccess
{
    public function isAdministrator(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        return in_array(
            Str::lower($user->user_id),
            collect(config('operations.admin_user_ids', []))
                ->map(fn (string $userId) => Str::lower($userId))
                ->all(),
            true,
        );
    }

    public function isVerified(Request $request): bool
    {
        return $this->isAdministrator($request->user())
            && now()->lessThan($request->session()->get('operations.verified_until', now()->subSecond()));
    }

    public function verify(Request $request, string $password): bool
    {
        if (! $this->matchesPassword($password)) {
            return false;
        }

        $request->session()->put(
            'operations.verified_until',
            now()->addMinutes(config('operations.verification_minutes'))->toIso8601String(),
        );

        return true;
    }

    public function matchesPassword(string $password): bool
    {
        $configuredPassword = config('operations.password');

        return is_string($configuredPassword)
            && $configuredPassword !== ''
            && hash_equals($configuredPassword, $password);
    }

    public function verifySession(Request $request, Session $session): void
    {
        $request->session()->put(
            $this->sessionVerificationKey($session),
            now()->addMinutes(config('operations.verification_minutes'))->toIso8601String(),
        );
    }

    public function isSessionVerified(Request $request, Session $session): bool
    {
        return $this->isVerified($request)
            && now()->lessThan($request->session()->get($this->sessionVerificationKey($session), now()->subSecond()));
    }

    public function forget(Request $request): void
    {
        $request->session()->forget('operations.verified_until');
    }

    private function sessionVerificationKey(Session $session): string
    {
        return "operations.session.{$session->id}.verified_until";
    }
}
