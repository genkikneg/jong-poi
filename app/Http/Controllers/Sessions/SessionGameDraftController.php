<?php

namespace App\Http\Controllers\Sessions;

use App\Events\SessionStateUpdated;
use App\Http\Controllers\Controller;
use App\Http\Requests\Sessions\ConfirmDraftRequest;
use App\Http\Requests\Sessions\StoreDraftEntryRequest;
use App\Models\Game;
use App\Models\GameResult;
use App\Models\Session;
use App\Models\SessionGameDraft;
use App\Services\GameResultsValidator;
use App\Services\PointsCalculator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class SessionGameDraftController extends Controller
{
    public function store(StoreDraftEntryRequest $request, Session $session): RedirectResponse
    {
        $payload = $request->entryPayload();

        $validationError = DB::transaction(function () use ($session, $request, $payload): ?string {
            $lockedSession = Session::query()
                ->whereKey($session->id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_if($lockedSession->isClosed(), 422, __('このセッションはクローズされています。'));

            $draft = SessionGameDraft::query()
                ->where('session_id', $lockedSession->id)
                ->lockForUpdate()
                ->first();

            if (! $draft) {
                $draft = SessionGameDraft::create([
                    'session_id' => $lockedSession->id,
                    'created_by' => $request->user()->id,
                ]);
            }

            $draft->entries()->updateOrCreate(
                [
                    'session_id' => $lockedSession->id,
                    'user_id' => $request->user()->id,
                ],
                [
                    'final_score' => (int) $payload['final_score'],
                    'rank' => $payload['rank'],
                ],
            );

            $memberIds = $lockedSession->members()->pluck('user_id');
            $entries = $draft->entries()->pluck('final_score', 'user_id');
            $isComplete = $entries->count() === $memberIds->count() && $memberIds->diffKeys($entries)->isEmpty();

            if (! $isComplete) {
                return null;
            }

            $expectedTotal = (float) $lockedSession->rule_base * $lockedSession->player_count;
            $actualTotal = $entries->reduce(fn ($carry, $score) => $carry + (float) $score, 0.0);
            $diff = $actualTotal - $expectedTotal;

            return abs($diff) > 1
                ? number_format($diff, 1)
                : null;
        });

        if ($validationError !== null) {
            return redirect()->back()->withErrors([
                'final_score' => __('点数の合計が想定より :value 点異なります。入力内容を再確認してください。', ['value' => $validationError]),
            ]);
        }

        broadcast(new SessionStateUpdated($session, 'draft.updated'));

        return redirect()->route('sessions.show', $session);
    }

    public function confirm(
        ConfirmDraftRequest $request,
        Session $session,
        GameResultsValidator $resultsValidator,
    ): RedirectResponse {
        $validationErrors = [];

        DB::transaction(function () use ($session, $request, $resultsValidator, &$validationErrors) {
            $lockedSession = Session::query()
                ->whereKey($session->id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_if($lockedSession->isClosed(), 422, __('このセッションはクローズされています。'));

            $draft = SessionGameDraft::query()
                ->where('session_id', $lockedSession->id)
                ->lockForUpdate()
                ->with('entries')
                ->first();

            if (! $draft) {
                $validationErrors = [
                    'draft' => __('この半荘はすでに確定されたか、入力中のデータがありません。'),
                ];

                return;
            }

            $entries = $draft->entries;
            $resultErrors = $resultsValidator->validate($lockedSession, $entries);

            if ($resultErrors !== []) {
                $validationErrors = [
                    'draft' => implode(' ', array_values($resultErrors)),
                ];

                return;
            }

            $calculator = new PointsCalculator($lockedSession);
            $computedResults = $calculator->calculate(
                $entries->map(fn ($entry) => [
                    'user_id' => $entry->user_id,
                    'final_score' => $entry->final_score,
                    'rank' => $entry->rank,
                ])->all()
            );
            $nextOrdinal = ($lockedSession->games()->max('ordinal') ?? 0) + 1;

            $game = Game::create([
                'session_id' => $lockedSession->id,
                'created_by' => $request->user()->id,
                'ordinal' => $nextOrdinal,
                'played_at' => now(),
            ]);

            foreach ($computedResults as $result) {
                GameResult::create([
                    'game_id' => $game->id,
                    'session_id' => $lockedSession->id,
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

        if ($validationErrors !== []) {
            return redirect()->back()->withErrors($validationErrors);
        }

        broadcast(new SessionStateUpdated($session, 'game.confirmed'));

        return redirect()->route('sessions.show', $session);
    }
}
