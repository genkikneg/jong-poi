<?php

namespace App\Http\Middleware;

use App\Services\OperationsAccess;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOperationsModeIsVerified
{
    public function __construct(private readonly OperationsAccess $operationsAccess) {}

    public function handle(Request $request, Closure $next): Response
    {
        if ($this->operationsAccess->isVerified($request)) {
            return $next($request);
        }

        $this->operationsAccess->forget($request);

        return redirect()
            ->route('operations.index')
            ->with('status', '運営モードの有効時間が過ぎました。もう一度有効にしてください。');
    }
}
