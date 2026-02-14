<?php

namespace App\Http\Controllers\Sessions;

use App\Http\Controllers\Controller;
use App\Http\Requests\Sessions\StoreGameRequest;
use App\Models\Game;
use App\Models\GameResult;
use App\Models\Session;
use App\Services\PointsCalculator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class GameController extends Controller
{
    public function store(StoreGameRequest $request, Session $session): RedirectResponse
    {
        abort_if($session->isClosed(), 422, __('このセッションはクローズされています。'));

        $calculator = new PointsCalculator($session);
        $computedResults = $calculator->calculate($request->resultPayload());

        DB::transaction(function () use ($session, $request, $computedResults) {
            $nextOrdinal = ($session->games()->max('ordinal') ?? 0) + 1;

            $game = Game::create([
                'session_id' => $session->id,
                'created_by' => $request->user()->id,
                'ordinal' => $nextOrdinal,
                'played_at' => $request->input('played_at'),
            ]);

            foreach ($computedResults as $result) {
                GameResult::create([
                    'game_id' => $game->id,
                    'session_id' => $session->id,
                    'user_id' => $result['user_id'],
                    'final_score' => $result['final_score'],
                    'rank' => $result['rank'],
                    'points' => $result['points'],
                    'score_diff' => $result['score_diff'],
                    'score_diff_scaled' => $result['score_diff_scaled'],
                    'rank_bonus' => $result['rank_bonus'],
                ]);
            }
        });

        return redirect()->route('sessions.show', $session);
    }
}
