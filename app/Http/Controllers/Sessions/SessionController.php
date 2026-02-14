<?php

namespace App\Http\Controllers\Sessions;

use App\Http\Controllers\Controller;
use App\Http\Requests\Sessions\StoreSessionRequest;
use App\Models\GameResult;
use App\Models\Session;
use App\Models\SessionMember;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SessionController extends Controller
{
    public function store(StoreSessionRequest $request): RedirectResponse
    {
        $user = $request->user();
        $friendIds = collect($request->friendIds())->unique()->values();
        $memberIds = $friendIds->prepend($user->id)->unique()->values();

        $session = DB::transaction(function () use ($request, $user, $memberIds) {
            $rules = $request->rulesPayload();

            $session = Session::create([
                'owner_id' => $user->id,
                'name' => $request->input('name'),
                'player_count' => $request->integer('player_count'),
                'rules_snapshot' => $rules,
                'rule_base' => $rules['base'],
                'rule_k' => $rules['k'],
                'rule_rank_bonus' => $rules['rank_bonus'],
            ]);

            $memberIds->each(function (int $memberId, int $index) use ($session, $user) {
                SessionMember::create([
                    'session_id' => $session->id,
                    'user_id' => $memberId,
                    'is_host' => $memberId === $user->id,
                    'seat_index' => $index,
                    'joined_at' => $memberId === $user->id ? now() : null,
                ]);
            });

            return $session;
        });

        return redirect()->route('sessions.show', $session);
    }

    public function show(Request $request, Session $session): Response
    {
        $this->authorizeMember($request->user()?->id, $session);

        $session->load([
            'owner:id,name,avatar_path',
            'members.user:id,name,avatar_path',
            'games' => fn ($query) => $query
                ->orderBy('ordinal')
                ->with(['results.user:id,name,avatar_path']),
            'gameDraft.entries.user:id,name,avatar_path',
        ]);

        $totals = GameResult::query()
            ->where('session_id', $session->id)
            ->selectRaw('user_id, SUM(points) as total_points')
            ->groupBy('user_id')
            ->pluck('total_points', 'user_id');
        $memberList = $session->members->map(fn ($member) => [
            'id' => $member->user->id,
            'name' => $member->user->name,
            'avatar' => $member->user->avatar,
            'is_host' => (bool) $member->is_host,
            'joined_at' => optional($member->joined_at)->toIso8601String(),
        ])->values();

        $players = $memberList->map(fn ($member) => [
            'id' => $member['id'],
            'name' => $member['name'],
            'avatar' => $member['avatar'] ?? null,
        ]);

        $rows = $session->games->map(function ($game) use ($players) {
            $scores = $players->mapWithKeys(fn ($player) => [
                $player['id'] => null,
            ]);

            foreach ($game->results as $result) {
                $scores[$result->user_id] = [
                    'points' => (string) $result->points,
                    'rank' => $result->rank,
                    'final_score' => (string) $result->final_score,
                ];
            }

            return [
                'id' => $game->id,
                'label' => "第{$game->ordinal}回",
                'played_at' => optional($game->played_at ?? $game->created_at)->toIso8601String(),
                'scores' => $players->map(fn ($player) => $scores[$player['id']] ?? null)->values(),
            ];
        })->values();

        $totalRow = [
            'id' => 'total',
            'label' => '合計',
            'played_at' => null,
            'scores' => $players->map(fn ($player) => [
                'points' => (string) ($totals[$player['id']] ?? 0),
                'rank' => null,
                'final_score' => null,
            ])->values(),
        ];

        $games = $session->games->map(fn ($game) => [
            'id' => $game->id,
            'ordinal' => $game->ordinal,
            'played_at' => optional($game->played_at ?? $game->created_at)->toIso8601String(),
            'results' => $game->results->map(fn ($result) => [
                'id' => $result->id,
                'user' => [
                    'id' => $result->user->id,
                    'name' => $result->user->name,
                    'avatar' => $result->user->avatar,
                ],
                'final_score' => (string) $result->final_score,
                'rank' => $result->rank,
                'points' => (string) $result->points,
            ])->values(),
        ])->values();

        $draft = $session->gameDraft;

        $draftEntries = $draft
            ? $memberList->map(function ($member) use ($draft) {
                $entry = $draft->entries->firstWhere('user_id', $member['id']);

                return [
                    'user_id' => $member['id'],
                    'name' => $member['name'],
                    'avatar' => $member['avatar'] ?? null,
                    'final_score' => $entry ? (string) $entry->final_score : null,
                    'rank' => $entry?->rank,
                    'submitted_at' => optional($entry?->updated_at)->toIso8601String(),
                ];
            })->values()
            : null;

        $draftData = $draft ? [
            'id' => $draft->id,
            'played_at' => optional($draft->played_at)->toIso8601String(),
            'entries' => $draftEntries,
        ] : null;

        $sessionData = [
            'id' => $session->id,
            'name' => $session->name,
            'player_count' => $session->player_count,
            'status' => $session->status->value,
            'owner_id' => $session->owner_id,
            'join_code' => $session->join_code,
            'rules' => [
                'base' => $session->rule_base,
                'k' => $session->rule_k,
                'rank_bonus' => $session->rule_rank_bonus,
            ],
            'members' => $memberList,
            'games' => $games,
        ];

        $tableData = [
            'players' => $players,
            'rows' => $rows->push($totalRow)->values(),
        ];

        $totalsPayload = $players->map(fn ($player) => [
            'user_id' => $player['id'],
            'name' => $player['name'],
            'avatar' => $player['avatar'] ?? null,
            'points' => (string) ($totals[$player['id']] ?? 0),
        ])->values();

        return Inertia::render('sessions/show', [
            'session' => $sessionData,
            'table' => $tableData,
            'draft' => $draftData,
            'totals' => $totalsPayload,
            'currentUserId' => $request->user()->id,
        ]);
    }

    public function close(Request $request, Session $session): RedirectResponse
    {
        $this->authorizeMember($request->user()?->id, $session);

        if (! $session->isClosed()) {
            $session->markClosed();
            $session->members()->update(['joined_at' => null]);
            $session->refresh();
        }

        return redirect()->route('sessions.show', $session);
    }

    protected function authorizeMember(?int $userId, Session $session): void
    {
        abort_unless(
            $userId && $session->members()->where('user_id', $userId)->exists(),
            403,
        );
    }
}
