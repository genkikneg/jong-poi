import { Form, Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AppLayout from '@/layouts/app-layout';
import { close as sessionsClose, show as sessionsShow } from '@/routes/sessions';
import draftRoutes from '@/routes/sessions/draft';
import type { BreadcrumbItem } from '@/types';

type SessionMember = {
    id: number;
    name: string;
    avatar?: string | null;
    is_host: boolean;
    joined_at: string | null;
};

type SessionGame = {
    id: number;
    ordinal: number;
    played_at: string | null;
    results: {
        id: number;
        user: { id: number; name: string; avatar?: string | null };
        final_score: string;
        rank: number;
        points: string;
    }[];
};

type SessionData = {
    id: number;
    name: string | null;
    player_count: number;
    status: 'open' | 'closed';
    owner_id: number;
    join_code: string;
    rules: {
        base: string;
        k: string;
        rank_bonus: Record<string, number>;
    };
    members: SessionMember[];
    games: SessionGame[];
};

type TotalsEntry = {
    user_id: number;
    name: string;
    avatar?: string | null;
    points: string;
};

type DraftEntry = {
    user_id: number;
    name: string;
    avatar?: string | null;
    final_score: string | null;
    rank: number | null;
    submitted_at: string | null;
};

type DraftData = {
    id: number;
    played_at: string | null;
    entries: DraftEntry[];
};

type Props = {
    session: SessionData;
    totals: TotalsEntry[];
    currentUserId: number;
    draft: DraftData | null;
};

const formatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
});

const rankColorStyles = {
    default: {
        container: 'bg-card border-border',
        badge: 'bg-muted text-muted-foreground',
        text: 'text-foreground',
    },
    1: {
        container: 'bg-amber-50 border-amber-200',
        badge: 'bg-amber-500/15 text-amber-800',
        text: 'text-amber-800',
    },
    2: {
        container: 'bg-sky-50 border-sky-200',
        badge: 'bg-sky-500/15 text-sky-800',
        text: 'text-sky-800',
    },
    3: {
        container: 'bg-emerald-50 border-emerald-200',
        badge: 'bg-emerald-500/15 text-emerald-800',
        text: 'text-emerald-800',
    },
    4: {
        container: 'bg-purple-50 border-purple-200',
        badge: 'bg-purple-500/15 text-purple-800',
        text: 'text-purple-800',
    },
} as const;

type RankStyleKey = keyof typeof rankColorStyles;

const getRankStyle = (rank?: number | null) => {
    if (rank) {
        const key = String(rank) as RankStyleKey;

        if (key in rankColorStyles) {
            return rankColorStyles[key];
        }
    }

    return rankColorStyles.default;
};

const breadcrumbs = (session: SessionData): BreadcrumbItem[] => [
    {
        title: 'セッション詳細',
        href: sessionsShow(session.id).url,
    },
];

export default function SessionShowPage({ session, totals, currentUserId, draft }: Props) {
    const isClosed = session.status === 'closed';
    const rankOptions = Array.from({ length: session.player_count }, (_, idx) => idx + 1);
    const isOwner = session.owner_id === currentUserId;
    const draftEntries: DraftEntry[] =
        draft?.entries ??
        session.members.map((member) => ({
            user_id: member.id,
            name: member.name,
            avatar: member.avatar,
            final_score: null,
            rank: null,
            submitted_at: null,
        }));
    const submittedCount = draftEntries.filter((entry) => entry.final_score !== null).length;
    const currentEntry = draftEntries.find((entry) => entry.user_id === currentUserId);
    const allSubmitted =
        draftEntries.length === session.player_count && submittedCount === session.player_count;
    const totalsRankMap = new Map<number, number>();
    const totalsSorted = [...totals]
        .map((entry) => ({ ...entry, numericPoints: Number(entry.points) }))
        .sort((a, b) => b.numericPoints - a.numericPoints);

    let lastPoints: number | null = null;
    let currentRankValue = 0;

    totalsSorted.forEach((entry, index) => {
        if (lastPoints === null || entry.numericPoints !== lastPoints) {
            currentRankValue = index + 1;
            lastPoints = entry.numericPoints;
        }

        totalsRankMap.set(entry.user_id, currentRankValue);
    });

    const expectedTotal = Number(session.rules.base) * session.player_count;
    const currentDraftTotal = draftEntries.reduce(
        (sum, entry) => sum + (entry.final_score ? Number(entry.final_score) : 0),
        0,
    );
    const draftTotalDiff = currentDraftTotal - expectedTotal;
    const draftTotalMismatch = Boolean(draft && allSubmitted && Math.abs(draftTotalDiff) > 1);
    const draftDiffText = Math.abs(draftTotalDiff).toLocaleString();
    const draftDiffDirection = draftTotalDiff > 0 ? '多い' : '少ない';
    const [confirmProcessing, setConfirmProcessing] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleConfirm = () => {
        if (!draft || !isOwner || draftTotalMismatch || !allSubmitted) {
            return;
        }

        setConfirmProcessing(true);
        router.post(
            draftRoutes.confirm.url(session.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setConfirmProcessing(false),
            },
        );
    };

    const confirmDisabled =
        !draft || !isOwner || !allSubmitted || draftTotalMismatch || confirmProcessing;

    const handleCopy = async () => {
        try {
            await navigator.clipboard?.writeText(session.join_code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            setCopied(false);
        }
    };

    const getInitials = useMemo(
        () =>
            (name: string) =>
                name
                    .split(' ')
                    .map((part) => part.trim()[0])
                    .join('')
                    .toUpperCase(),
        [],
    );

    const renderUserName = (name: string, size: 'sm' | 'md' = 'md', avatarUrl?: string | null) => (
        <span className="flex items-center gap-2">
            <Avatar className={size === 'sm' ? 'h-7 w-7' : 'h-9 w-9'}>
                {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
                <AvatarFallback>{getInitials(name)}</AvatarFallback>
            </Avatar>
            <span>{name}</span>
        </span>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs(session)}>
            <Head title={session.name ? `${session.name} | セッション` : 'セッション詳細'} />

            <div className="space-y-6">
                <Heading
                    title={session.name || 'セッション詳細'}
                    description={
                        <div className="flex flex-wrap items-center gap-3">
                            <span>
                                参加コード:{' '}
                                <span className="font-mono text-base tracking-wider">
                                    {session.join_code}
                                </span>
                            </span>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleCopy}
                                className={cn('border-dashed', copied && 'border-primary text-primary')}
                            >
                                {copied ? 'コピー済み' : 'コピー'}
                            </Button>
                        </div>
                    }
                />

                {!isClosed && (
                    <Card>
                        <CardHeader>
                            <CardTitle>半荘結果を入力</CardTitle>
                            <CardDescription>
                                各自が自分の最終持ち点を入力し、ホストが全員分を確認して確定します。
                                {draftEntries.length > 0 && (
                                    <span className="ml-2 text-xs">
                                        現在 {submittedCount}/{session.player_count} 人が入力済み
                                    </span>
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-muted-foreground">自分のスコア</h3>
                                <Form {...draftRoutes.store.form(session.id)} className="space-y-4">
                                    {({ processing, errors }) => (
                                        <>
                                            <div className="flex flex-col gap-4 md:flex-row">
                                                <div className="flex-1 space-y-2">
                                                    <Label htmlFor="final_score">最終持ち点</Label>
                                                    <Input
                                                        id="final_score"
                                                        name="final_score"
                                                        type="number"
                                                        step="100"
                                                        required
                                                        defaultValue={currentEntry?.final_score ?? ''}
                                                    />
                                                    <InputError message={errors.final_score} />
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <Label htmlFor="rank">最終順位（任意）</Label>
                                                    <select
                                                        id="rank"
                                                        name="rank"
                                                        defaultValue={currentEntry?.rank?.toString() ?? ''}
                                                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                                    >
                                                        <option value="">自動判定</option>
                                                        {rankOptions.map((rank) => (
                                                            <option key={rank} value={rank}>
                                                                {rank}位
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <InputError message={errors.rank} />
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap justify-end gap-2">
                                                <Button type="submit" disabled={processing}>
                                                    {currentEntry?.final_score ? '更新する' : '送信する'}
                                                </Button>
                                                {isOwner && draft && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        disabled={confirmDisabled}
                                                        onClick={handleConfirm}
                                                        className={cn(
                                                            'border-2',
                                                            confirmDisabled
                                                                ? 'border-border'
                                                                : 'border-primary text-primary shadow-[0_0_0_1px_rgba(59,130,246,0.4)] hover:bg-primary/5'
                                                        )}
                                                    >
                                                        全員分を確定する
                                                    </Button>
                                                )}
                                            </div>
                                            {isOwner && draft && !allSubmitted && (
                                                <p className="text-sm text-muted-foreground">
                                                    全員の入力が揃うまで確定できません。
                                                </p>
                                            )}
                                        </>
                                    )}
                                </Form>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-muted-foreground">入力状況</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {draftEntries.map((entry) => (
                                        <div
                                            key={entry.user_id}
                                            className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                                                entry.final_score
                                                    ? 'bg-emerald-50 border-emerald-200'
                                                    : 'bg-card border-border'
                                            }`}
                                        >
                                            <div>
                                                <div className="font-medium">
                                                    {renderUserName(entry.name, 'sm', entry.avatar)}
                                                    {entry.user_id === currentUserId && (
                                                        <span className="ml-2 text-xs text-primary">(自分)</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {entry.final_score
                                                        ? `${Number(entry.final_score).toLocaleString()} 点`
                                                        : '未入力'}
                                                </p>
                                            </div>
                                            <div className="text-sm font-semibold text-muted-foreground">
                                                {entry.rank ? `${entry.rank}位` : ''}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {draftTotalMismatch && (
                                    <p className="text-sm text-amber-700">
                                        現在 {draftDiffDirection === '多い' ? '+' : '-'}
                                        {draftDiffText} 点。入力を修正してください。
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>合計ポイント</CardTitle>
                        <CardDescription>半荘の合計。加算順序に関わらず同じ計算式です。</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        {totals.map((entry) => {
                            const rank = totalsRankMap.get(entry.user_id) ?? null;
                            const rankStyle = getRankStyle(rank);

                            return (
                                <div
                                    key={entry.user_id}
                                    className={`rounded-lg border px-4 py-3 transition-colors ${rankStyle.container}`}
                                >
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="text-muted-foreground">
                                            {renderUserName(entry.name, 'sm', entry.avatar)}
                                        </div>
                                        {rank && (
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${rankStyle.badge}`}
                                            >
                                                第{rank}位
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-2xl font-semibold ${rankStyle.text}`}>
                                        {Number(entry.points).toLocaleString(undefined, {
                                            maximumFractionDigits: 0,
                                            minimumFractionDigits: 0,
                                        })}
                                    </p>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                {session.games.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>半荘履歴</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {session.games.map((game) => (
                                <div key={game.id} className="rounded-xl border p-4">
                                    <div className="hidden md:block">
                                        <div className="flex flex-col gap-1 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                                            <span>第{game.ordinal}回</span>
                                            <span>
                                                {game.played_at
                                                    ? formatter.format(new Date(game.played_at))
                                                    : '日時未入力'}
                                            </span>
                                        </div>
                                        <div className="mt-3 grid gap-2 md:grid-cols-4">
                                            {game.results.map((result) => (
                                                <div
                                                    key={result.id}
                                                    className={`rounded-lg border px-3 py-2 ${getRankStyle(result.rank).container}`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-sm font-medium">
                                                            {renderUserName(result.user.name, 'sm', result.user.avatar)}
                                                        </div>
                                                        <span
                                                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getRankStyle(result.rank).badge}`}
                                                        >
                                                            {result.rank ? `第${result.rank}位` : '順位未入力'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {Number(result.final_score).toLocaleString()} 点
                                                    </p>
                                                    <p className={`text-lg font-semibold text-primary`}>
                                                        {Number(result.points).toLocaleString(undefined, {
                                                            maximumFractionDigits: 0,
                                                            minimumFractionDigits: 0,
                                                        })}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="md:hidden">
                                        <details className="group">
                                            <summary className="flex cursor-pointer list-none flex-col gap-3 text-sm text-muted-foreground">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium">第{game.ordinal}回</span>
                                                    <span className="flex items-center gap-2">
                                                        {game.played_at
                                                            ? formatter.format(new Date(game.played_at))
                                                            : '日時未入力'}
                                                        <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-3">
                                                    {game.results.map((result) => (
                                                        <div
                                                            key={`summary-${result.id}`}
                                                            className="relative"
                                                        >
                                                            <span
                                                                className={cn(
                                                                    'flex h-[2.3rem] w-[2.3rem] items-center justify-center rounded-full border text-base font-semibold',
                                                                    getRankStyle(result.rank).badge,
                                                                )}
                                                            >
                                                                {result.rank ?? '-'}
                                                            </span>
                                                            <Avatar className="absolute bottom-0 right-0 h-[1.9rem] w-[1.9rem] translate-x-[35%] translate-y-[35%] border-2 border-background shadow">
                                                                {result.user.avatar && (
                                                                    <AvatarImage src={result.user.avatar} alt={result.user.name} />
                                                                )}
                                                                <AvatarFallback>
                                                                    {getInitials(result.user.name)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                        </div>
                                                    ))}
                                                </div>
                                            </summary>
                                            <div className="mt-3 space-y-2">
                                                {game.results.map((result) => (
                                                    <div
                                                        key={result.id}
                                                        className={`rounded-lg border px-3 py-2 ${getRankStyle(result.rank).container}`}
                                                    >
                                                        <div className="flex items-center justify-between text-sm">
                                                            <div className="font-medium">
                                                                {renderUserName(result.user.name, 'sm', result.user.avatar)}
                                                            </div>
                                                            <span
                                                                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getRankStyle(result.rank).badge}`}
                                                            >
                                                                {result.rank ? `第${result.rank}位` : '順位未入力'}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            {Number(result.final_score).toLocaleString()} 点
                                                        </p>
                                                        <p className="text-base font-semibold text-primary">
                                                            {Number(result.points).toLocaleString(undefined, {
                                                                maximumFractionDigits: 0,
                                                                minimumFractionDigits: 0,
                                                            })}
                                                            pt
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </details>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {!isClosed && (
                    <Form {...sessionsClose.form(session.id)}>
                        {({ processing }) => (
                            <Button type="submit" variant="destructive" disabled={processing}>
                                セッションを終了する
                            </Button>
                        )}
                    </Form>
                )}
            </div>
        </AppLayout>
    );
}
