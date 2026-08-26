<?php

namespace App\Http\Middleware;

use App\Models\Game;
use App\Models\Session;
use App\Services\OperationsAccess;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSessionCorrectionIsVerified
{
    public function __construct(private readonly OperationsAccess $operationsAccess) {}

    public function handle(Request $request, Closure $next): Response
    {
        $routeModel = $request->route('session') ?? $request->route('game');
        $session = $routeModel instanceof Game ? $routeModel->session : $routeModel;

        abort_unless($session instanceof Session, 404);

        if ($this->operationsAccess->isSessionVerified($request, $session)) {
            return $next($request);
        }

        return redirect()
            ->route('operations.sessions.index')
            ->with('status', 'セッションを訂正するには、選択時に運営用パスワードを入力してください。');
    }
}
