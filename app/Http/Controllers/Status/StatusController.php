<?php

namespace App\Http\Controllers\Status;

use App\Http\Controllers\Controller;
use App\Http\Requests\StatusFilterRequest;
use App\Services\PlayerStatisticsService;
use Inertia\Inertia;
use Inertia\Response;

class StatusController extends Controller
{
    public function __construct(private readonly PlayerStatisticsService $statistics) {}

    public function index(StatusFilterRequest $request): Response
    {
        $filters = $request->filters();

        return Inertia::render('status/index', [
            ...$this->statistics->build($request->user(), $filters),
            'filters' => $filters,
        ]);
    }
}
