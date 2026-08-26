<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request): JsonResponse|\Illuminate\Http\RedirectResponse
    {
        if ($request instanceof Request && $request->wantsJson()) {
            return response()->json(['two_factor' => false]);
        }

        return to_route('dashboard');
    }
}
