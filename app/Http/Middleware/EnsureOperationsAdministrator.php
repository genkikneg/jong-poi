<?php

namespace App\Http\Middleware;

use App\Services\OperationsAccess;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOperationsAdministrator
{
    public function __construct(private readonly OperationsAccess $operationsAccess) {}

    public function handle(Request $request, Closure $next): Response
    {
        abort_unless($this->operationsAccess->isAdministrator($request->user()), 404);

        return $next($request);
    }
}
