<?php

namespace App\Http\Controllers\Sessions;

use App\Http\Controllers\Controller;
use App\Http\Requests\Sessions\JoinSessionRequest;
use App\Models\Session;
use Illuminate\Http\RedirectResponse;

class SessionJoinController extends Controller
{
    public function store(JoinSessionRequest $request): RedirectResponse
    {
        $session = Session::where('join_code', $request->code())->firstOrFail();
        $user = $request->user();

        abort_if($session->isClosed(), 422, __('このセッションは終了しています。'));

        $member = $session->members()->where('user_id', $user->id)->first();

        abort_if(! $member, 403, __('招待されたメンバーのみ参加できます。'));

        if (! $member->joined_at) {
            $member->forceFill(['joined_at' => now()])->save();
        }

        return redirect()->route('sessions.show', $session);
    }
}
