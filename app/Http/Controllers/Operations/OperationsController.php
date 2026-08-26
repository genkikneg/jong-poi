<?php

namespace App\Http\Controllers\Operations;

use App\Http\Controllers\Controller;
use App\Http\Requests\Operations\CorrectGameRequest;
use App\Http\Requests\Operations\IssueRecoveryCodeRequest;
use App\Http\Requests\Operations\VerifyOperationsPasswordRequest;
use App\Http\Requests\Operations\VerifySessionCorrectionRequest;
use App\Models\Game;
use App\Models\OperationAudit;
use App\Models\Session;
use App\Models\User;
use App\Models\UserRecoveryCode;
use App\Services\OperationsAccess;
use App\Services\PointsCalculator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class OperationsController extends Controller
{
    public function __construct(private readonly OperationsAccess $operationsAccess) {}

    public function index(Request $request): Response
    {
        return Inertia::render('settings/operations', [
            'verified' => $this->operationsAccess->isVerified($request),
        ]);
    }

    public function users(Request $request): Response
    {
        $query = trim($request->string('q')->toString());
        $sort = $request->string('sort')->toString();
        $sort = in_array($sort, ['user_id', 'name'], true) ? $sort : 'user_id';
        $direction = $request->string('direction')->toString();
        $direction = in_array($direction, ['asc', 'desc'], true) ? $direction : 'asc';

        $users = User::query()
            ->when($query !== '', function ($builder) use ($query) {
                $builder->where(function ($search) use ($query) {
                    $search
                        ->where('name', 'like', "%{$query}%")
                        ->orWhere('user_id', 'like', "%{$query}%");
                });
            })
            ->orderBy($sort, $direction)
            ->paginate(30)
            ->withQueryString()
            ->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'user_id' => $user->user_id,
                'friend_code' => $user->friend_code,
            ]);

        return Inertia::render('settings/operations/users', [
            'verified' => $this->operationsAccess->isVerified($request),
            'query' => $query,
            'sort' => $sort,
            'direction' => $direction,
            'users' => $users,
        ]);
    }

    public function sessions(Request $request): Response
    {
        $query = trim($request->string('q')->toString());
        $memberUserId = trim($request->string('member_user_id')->toString());
        $playedFrom = $request->string('played_from')->toString() ?: null;
        $playedTo = $request->string('played_to')->toString() ?: null;
        $sort = $request->string('sort')->toString();
        $sort = in_array($sort, ['played_at', 'updated_at', 'name'], true) ? $sort : 'played_at';
        $direction = $request->string('direction')->toString();
        $direction = in_array($direction, ['asc', 'desc'], true) ? $direction : 'desc';
        $selectedUser = $memberUserId === ''
            ? null
            : User::query()->where('user_id', $memberUserId)->first(['id', 'name', 'user_id']);
        $latestPlayedAt = Game::query()
            ->select('played_at')
            ->whereColumn('games.session_id', 'mahjong_sessions.id')
            ->orderByDesc('played_at')
            ->limit(1);

        $sessions = Session::query()
            ->with('owner:id,name')
            ->withMax('games', 'played_at')
            ->when($query !== '', function ($builder) use ($query) {
                $builder->where(function ($search) use ($query) {
                    $search
                        ->where('name', 'like', "%{$query}%")
                        ->orWhere('join_code', 'like', "%{$query}%")
                        ->orWhere('id', 'like', "%{$query}%")
                        ->orWhereHas('owner', fn ($owner) => $owner->where('name', 'like', "%{$query}%"));
                });
            })
            ->when($memberUserId !== '', function ($builder) use ($selectedUser) {
                if (! $selectedUser) {
                    $builder->whereRaw('1 = 0');

                    return;
                }

                $builder->whereHas('members', fn ($members) => $members->where('user_id', $selectedUser->id));
            })
            ->when($playedFrom, fn ($builder) => $builder->whereHas('games', fn ($games) => $games->whereDate('played_at', '>=', $playedFrom)))
            ->when($playedTo, fn ($builder) => $builder->whereHas('games', fn ($games) => $games->whereDate('played_at', '<=', $playedTo)))
            ->when(
                $sort === 'played_at',
                fn ($builder) => $builder->orderBy($latestPlayedAt, $direction),
                fn ($builder) => $builder->orderBy($sort, $direction),
            )
            ->paginate(30)
            ->withQueryString()
            ->through(fn (Session $session) => [
                'id' => $session->id,
                'name' => $session->name,
                'join_code' => $session->join_code,
                'status' => $session->status->value,
                'owner' => $session->owner?->name,
                'updated_at' => $session->updated_at?->toIso8601String(),
                'played_at' => $session->games_max_played_at,
            ]);

        return Inertia::render('settings/operations/sessions', [
            'verified' => $this->operationsAccess->isVerified($request),
            'query' => $query,
            'memberUserId' => $memberUserId,
            'selectedUser' => $selectedUser ? [
                'name' => $selectedUser->name,
                'user_id' => $selectedUser->user_id,
            ] : null,
            'playedFrom' => $playedFrom,
            'playedTo' => $playedTo,
            'sort' => $sort,
            'direction' => $direction,
            'sessions' => $sessions,
        ]);
    }

    public function showSession(Session $session): Response
    {
        $session->load(['games' => fn ($query) => $query->orderBy('ordinal')->with('results.user:id,name,user_id')]);

        return Inertia::render('settings/operations/session', [
            'session' => [
                'id' => $session->id,
                'name' => $session->name,
                'games' => $session->games->map(fn (Game $game) => [
                    'id' => $game->id,
                    'ordinal' => $game->ordinal,
                    'played_at' => $game->played_at?->toIso8601String(),
                    'results' => $game->results->map(fn ($result) => [
                        'user_id' => $result->user_id,
                        'name' => $result->user->name,
                        'final_score' => (string) $result->final_score,
                        'rank' => $result->rank,
                    ])->values(),
                ])->values(),
            ],
        ]);
    }

    public function openSession(VerifySessionCorrectionRequest $request, Session $session): RedirectResponse
    {
        if (! $this->operationsAccess->matchesPassword($request->string('operations_password')->toString())) {
            return back()->withErrors(['operations_password' => '運営用パスワードが正しくありません。']);
        }

        $this->operationsAccess->verifySession($request, $session);

        return redirect()->route('operations.sessions.show', $session);
    }

    public function audits(Request $request): Response
    {
        return Inertia::render('settings/operations/audits', [
            'audits' => OperationAudit::query()
                ->with('actor:id,name,user_id')
                ->latest()
                ->paginate(50)
                ->withQueryString()
                ->through(fn (OperationAudit $audit) => [
                    'id' => $audit->id,
                    'action' => $audit->action,
                    'target_type' => $audit->target_type,
                    'target_id' => $audit->target_id,
                    'reason' => $audit->reason,
                    'actor' => $audit->actor?->name,
                    'created_at' => $audit->created_at?->toIso8601String(),
                ]),
        ]);
    }

    public function verify(VerifyOperationsPasswordRequest $request): RedirectResponse
    {
        if (! $this->operationsAccess->verify($request, $request->string('operations_password')->toString())) {
            return back()->withErrors(['operations_password' => '運営用パスワードが正しくありません。']);
        }

        return back();
    }

    public function issueRecoveryCode(IssueRecoveryCodeRequest $request, User $user): RedirectResponse
    {
        $this->authorizeSensitiveOperation($request, $request->string('operations_password')->toString());

        $code = Str::upper(Str::random(12));

        UserRecoveryCode::query()
            ->where('user_id', $user->id)
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->update(['expires_at' => now()]);

        UserRecoveryCode::create([
            'user_id' => $user->id,
            'issued_by' => $request->user()->id,
            'code_hash' => $this->hashRecoveryCode($code),
            'expires_at' => now()->addMinutes(config('operations.recovery_code_minutes')),
        ]);

        $this->audit($request, 'recovery_code_issued', 'user', $user->id);

        return back()->with('recovery_code', $code);
    }

    public function correctGame(CorrectGameRequest $request, Game $game): RedirectResponse
    {
        DB::transaction(function () use ($request, $game) {
            $lockedGame = Game::query()
                ->with(['session', 'results'])
                ->lockForUpdate()
                ->findOrFail($game->id);
            $before = $lockedGame->results
                ->map(fn ($result) => [
                    'user_id' => $result->user_id,
                    'final_score' => (string) $result->final_score,
                    'rank' => $result->rank,
                    'points' => (string) $result->points,
                ])
                ->values()
                ->all();
            $computedResults = app(PointsCalculator::class, ['session' => $lockedGame->session])
                ->calculate($request->resultPayload());

            $lockedGame->update(['played_at' => $request->input('played_at')]);

            foreach ($computedResults as $result) {
                $lockedGame->results()
                    ->where('user_id', $result['user_id'])
                    ->update($result);
            }

            $this->audit(
                $request,
                'game_corrected',
                'game',
                $lockedGame->id,
                $request->string('reason')->toString(),
                $before,
                $computedResults,
            );
        });

        return redirect()->route('operations.sessions.show', $game->session_id);
    }

    private function authorizeSensitiveOperation(Request $request, string $password): void
    {
        abort_unless(
            $this->operationsAccess->isVerified($request)
                && $this->operationsAccess->matchesPassword($password),
            403,
        );
    }

    private function audit(
        Request $request,
        string $action,
        string $targetType,
        int $targetId,
        ?string $reason = null,
        ?array $before = null,
        ?array $after = null,
    ): void {
        OperationAudit::create([
            'actor_id' => $request->user()->id,
            'action' => $action,
            'target_type' => $targetType,
            'target_id' => $targetId,
            'reason' => $reason,
            'before' => $before,
            'after' => $after,
        ]);
    }

    private function hashRecoveryCode(string $code): string
    {
        return hash_hmac('sha256', $code, config('app.key'));
    }
}
