import { useMemo, useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FriendDetailDialog, type FriendDetail } from '@/components/friend-detail-dialog';
import { useFriendDetailDialog } from '@/hooks/use-friend-detail-dialog';
import { cn } from '@/lib/utils';

type RankingPlayer = {
    id: number;
    name: string;
    friend_code: string;
    avatar?: string | null;
    stats: FriendDetail['stats'];
    rankings?: FriendDetail['rankings'];
    games_played: number;
    total_points: number;
    average_points: number;
    top_finishes: number;
    top_rate: number;
};

type Props = {
    players: RankingPlayer[];
    period: 'all' | 'year' | 'month' | 'week';
};

const tabs = [
    { value: 'total', label: '累計ポイント', description: '全期間の素点合計順です。' },
    { value: 'average', label: '平均ポイント', description: '1半荘あたりの平均ポイント順です。' },
    { value: 'top_rate', label: 'トップ率', description: 'トップ獲得率順です。' },
] as const;

const breadcrumbs = [
    {
        title: 'Rankings',
        href: '/rankings',
    },
];

const getInitials = (name: string) =>
    name
        .trim()
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

export default function RankingsPage({ players = [], period: initialPeriod = 'all' }: Props) {
    const { auth } = usePage().props as { auth: { user: { id: number } } };
    const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['value']>('total');
    const [period, setPeriod] = useState<'all' | 'year' | 'month' | 'week'>(initialPeriod);
    const { friendDetailDialogProps, openFriendDetail } = useFriendDetailDialog();

    const sortedPlayers = useMemo(() => {
        const byTotal = [...players].sort((a, b) => b.total_points - a.total_points);
        const byAverage = [...players].sort((a, b) => b.average_points - a.average_points);
        const byTopRate = [...players].sort((a, b) => b.top_rate - a.top_rate);

        return {
            total: byTotal,
            average: byAverage,
            top_rate: byTopRate,
        } as const;
    }, [players]);

    const visiblePlayers = sortedPlayers[activeTab].slice(0, 50);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rankings" />

            <div className="space-y-6">
                <Heading
                    title="ランキング"
                    description="5局以上プレイしたプレイヤーの成績を一覧できます。"
                />

                <div className="flex flex-wrap items-center gap-3">
                    <label className="text-sm text-muted-foreground" htmlFor="period">
                        期間
                    </label>
                    <select
                        id="period"
                        className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                        value={period}
                        onChange={(event) => {
                            setPeriod(event.target.value as typeof period);
                            router.get('/rankings', { period: event.target.value }, { preserveState: true, preserveScroll: true });
                        }}
                    >
                        <option value="all">全期間</option>
                        <option value="year">今年</option>
                        <option value="month">今月</option>
                        <option value="week">今週</option>
                    </select>
                </div>

                <div className="flex flex-wrap gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value)}
                            className={cn(
                                'group relative overflow-hidden rounded-full bg-muted px-4 py-2 text-sm font-medium text-muted-foreground transition',
                                activeTab === tab.value
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-primary/10',
                            )}
                        >
                            <span className="relative z-10">{tab.label}</span>
                            <span
                                className={cn(
                                    'absolute inset-0 translate-y-full scale-110 rounded-full bg-primary transition',
                                    activeTab === tab.value && 'translate-y-0 scale-100',
                                )}
                            />
                        </button>
                    ))}
                </div>

                <p className="text-sm text-muted-foreground">
                    {tabs.find((tab) => tab.value === activeTab)?.description}
                </p>

                <Card>
                    <CardContent className="divide-y">
                        {visiblePlayers.length === 0 && (
                            <p className="py-6 text-sm text-muted-foreground">
                                データがありません。半荘をプレイして統計を貯めましょう。
                            </p>
                        )}
                        {visiblePlayers.map((player, index) => (
                            <div
                                key={player.id}
                                className="flex items-center justify-between gap-3 py-3 text-sm"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="w-6 text-base font-semibold text-muted-foreground">
                                        #{index + 1}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            openFriendDetail({
                                                id: player.id,
                                                name: player.name,
                                                friend_code: player.friend_code,
                                                avatar: player.avatar,
                                                stats: player.stats,
                                                relation_status: player.id === auth.user.id ? 'self' : 'none',
                                                rankings: player.rankings,
                                            })
                                        }
                                        className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                                    >
                                        <Avatar className="size-12">
                                            {player.avatar && <AvatarImage src={player.avatar} alt={player.name} />}
                                            <AvatarFallback>{getInitials(player.name)}</AvatarFallback>
                                        </Avatar>
                                    </button>
                                    <div>
                                        <p className="font-semibold">{player.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            参加 {player.games_played} 回 / トップ {player.top_finishes}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right text-base font-semibold">
                                    {activeTab === 'total' && (
                                        <span>{Math.round(player.total_points).toLocaleString()} pt</span>
                                    )}
                                    {activeTab === 'average' && (
                                        <span>{player.average_points.toFixed(1)} pt</span>
                                    )}
                                    {activeTab === 'top_rate' && (
                                        <span>{(player.top_rate * 100).toFixed(1)}%</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <FriendDetailDialog {...friendDetailDialogProps} />
        </AppLayout>
    );
}
