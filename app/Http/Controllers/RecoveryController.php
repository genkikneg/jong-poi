<?php

namespace App\Http\Controllers;

use App\Http\Requests\Recovery\CompleteRecoveryRequest;
use App\Http\Requests\Recovery\VerifyRecoveryCodeRequest;
use App\Models\OperationAudit;
use App\Models\UserRecoveryCode;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RecoveryController extends Controller
{
    public function create(): Response
    {
        request()->session()->forget('account_recovery.code_id');

        return Inertia::render('auth/recover-account');
    }

    public function verify(VerifyRecoveryCodeRequest $request): RedirectResponse
    {
        $codeHash = hash_hmac('sha256', $request->string('code')->toString(), config('app.key'));
        $recoveryCode = UserRecoveryCode::query()
            ->where('code_hash', $codeHash)
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->first();

        if (! $recoveryCode) {
            return back()->withErrors(['code' => '復旧コードが正しくないか、有効期限が切れています。']);
        }

        $request->session()->regenerate();
        $request->session()->put('account_recovery.code_id', $recoveryCode->id);

        return redirect()->route('recovery.password.edit');
    }

    public function password(): Response|RedirectResponse
    {
        if (! $this->activeRecoveryCode(request())) {
            request()->session()->forget('account_recovery.code_id');

            return redirect()
                ->route('recovery.create')
                ->with('status', '復旧コードの有効期限が切れています。もう一度入力してください。');
        }

        return Inertia::render('auth/recover-account-password');
    }

    public function store(CompleteRecoveryRequest $request): RedirectResponse
    {
        $recoveryCodeId = $request->session()->get('account_recovery.code_id');

        $recovered = DB::transaction(function () use ($request, $recoveryCodeId) {
            $recoveryCode = UserRecoveryCode::query()
                ->with('user')
                ->whereKey($recoveryCodeId)
                ->whereNull('used_at')
                ->where('expires_at', '>', now())
                ->lockForUpdate()
                ->first();

            if (! $recoveryCode) {
                return false;
            }

            $user = $recoveryCode->user;
            $user->update([
                'password' => $request->string('password')->toString(),
                'remember_token' => null,
            ]);
            $recoveryCode->update(['used_at' => now()]);

            OperationAudit::create([
                'actor_id' => $recoveryCode->issued_by,
                'action' => 'account_recovered',
                'target_type' => 'user',
                'target_id' => $user->id,
                'before' => null,
                'after' => null,
            ]);

            DB::table('sessions')->where('user_id', $user->id)->delete();

            return $user;
        });

        if (! $recovered) {
            $request->session()->forget('account_recovery.code_id');

            return redirect()
                ->route('recovery.create')
                ->with('status', '復旧コードが正しくないか、有効期限が切れています。もう一度入力してください。');
        }

        Auth::login($recovered);
        $request->session()->regenerate();
        $request->session()->forget('account_recovery.code_id');

        return redirect()->route('dashboard');
    }

    private function activeRecoveryCode(\Illuminate\Http\Request $request): ?UserRecoveryCode
    {
        return UserRecoveryCode::query()
            ->whereKey($request->session()->get('account_recovery.code_id'))
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->first();
    }
}
