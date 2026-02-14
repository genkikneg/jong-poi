<?php

namespace App\Http\Controllers\Sessions;

use App\Http\Controllers\Controller;
use App\Http\Requests\Sessions\ConfirmDraftRequest;
use App\Http\Requests\Sessions\StoreDraftEntryRequest;
use App\Models\Game;
use App\Models\GameResult;
use App\Models\Session;
use App\Models\SessionGameDraft;
use App\Services\PointsCalculator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class SessionGameDraftController extends Controller
{
    public function store(StoreDraftEntryRequest $request, Session $session): RedirectResponse
    {
        abort_if($session->isClosed(), 422, __('このセッションはクローズされています。'));

        $draft = $session->gameDraft;

        if (! $draft) {
            $draft = SessionGameDraft::create([
                'session_id' => $session->id,
                'created_by' => $request->user()->id,
            ]);
        }

        $payload = $request->entryPayload();

        $draft->entries()->updateOrCreate(
            [
                'session_id' => $session->id,
                'user_id' => $request->user()->id,
            ],
            [
                'final_score' => (int) $payload['final_score'],
                'rank' => $payload['rank'],
            ],
        );

        $memberIds = $session->members()->pluck('user_id');
        $entries = $draft->entries()->pluck('final_score', 'user_id');
        $isComplete = $entries->count() === $memberIds->count() && $memberIds->diffKeys($entries)->isEmpty();

        if ($isComplete) {
            $expectedTotal = (float) $session->rule_base * $session->player_count;
            $actualTotal = $entries->reduce(fn ($carry, $score) => $carry + (float) $score, 0.0);
            $diff = $actualTotal - $expectedTotal;

            if (abs($diff) > 1) {
                $diffText = number_format($diff, 1);

                return redirect()->back()->withErrors([
                    'final_score' => __('点数の合計が想定より :value 点異なります。入力内容を再確認してください。', ['value' => $diffText]),
                ]);
            }
        }

        return redirect()->route('sessions.show', $session);
    }

    public function confirm(ConfirmDraftRequest $request, Session $session): RedirectResponse
    {
        abort_if($session->isClosed(), 422, __('このセッションはクローズされています。'));

        $draft = $session->gameDraft()->with(['entries.user:id,name'])->first();

        abort_unless($draft, 422, __('入力中の半荘がありません。'));

        $entries = $draft->entries;

        if ($entries->count() !== $session->player_count) {
            return redirect()->back()->withErrors([
                'draft' => __('全員分のスコアが揃っていません。'),
            ]);
        }

        $memberIds = $session->members()->pluck('user_id');
        $missing = $memberIds->diff($entries->pluck('user_id'));

        if ($missing->isNotEmpty()) {
            return redirect()->back()->withErrors([
                'draft' => __('全員分のスコアが揃っていません。'),
            ]);
        }

        $calculator = new PointsCalculator($session);
        $computedResults = $calculator->calculate(
            $entries->map(fn ($entry) => [
                'user_id' => $entry->user_id,
                'final_score' => $entry->final_score,
                'rank' => $entry->rank,
            ])->all()
        );

        DB::transaction(function () use ($session, $request, $computedResults, $draft) {
            $nextOrdinal = ($session->games()->max('ordinal') ?? 0) + 1;

            $game = Game::create([
                'session_id' => $session->id,
                'created_by' => $request->user()->id,
                'ordinal' => $nextOrdinal,
                'played_at' => now(),
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

            $draft->entries()->delete();
            $draft->delete();
        });

        return redirect()->route('sessions.show', $session);
    }
}
