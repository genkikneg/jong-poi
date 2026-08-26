import { Head, router } from '@inertiajs/react';
import { SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import AppLayout from '@/layouts/app-layout';
import { status as statusRoute } from '@/routes';

type Game = { id: number; points: string; rank: number; final_score: string; played_at: string | null; cumulative_points?: number; session?: { id: number; name: string | null; player_count: number } | null };
type Summary = { total_points: string; total_games: number; total_sessions: number; average_points: number | null; average_rank: number | null; top_rate: number | null; top_two_rate: number | null; last_rate: number | null };
type Filters = { period: string; from: string | null; to: string | null; player_count: number | null; opponent_id: number | null };
type Props = {
    summary: Summary;
    recentGames: Game[];
    trend: Game[];
    detailedStats: { rank_rates: Record<number, { count: number; rate: number }>; best_game_points: string; worst_game_points: string; best_session_points: string; worst_session_points: string; average_session_points: string; flying_rate: number };
    filters: Filters;
    opponents: { id: number; name: string }[];
};

const nf = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });
const df = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });
const percent = (value: number | null) => value === null ? '—' : `${nf.format(value * 100)}%`;
const periodLabels: Record<string, string> = { all: '全期間', year: '今年', month: '今月', week: '今週', custom: '期間指定' };
const rankColors = ['bg-amber-400', 'bg-sky-400', 'bg-emerald-400', 'bg-purple-400'];
const rankTextColors = ['text-amber-700 dark:text-amber-300', 'text-sky-700 dark:text-sky-300', 'text-emerald-700 dark:text-emerald-300', 'text-purple-700 dark:text-purple-300'];

export default function StatusPage({ summary, recentGames, trend, detailedStats, filters, opponents }: Props) {
    const [chartMode, setChartMode] = useState<'rank' | 'points' | 'cumulative'>('rank');
    const [desktopGameCount, setDesktopGameCount] = useState<10 | 30 | 50>(30);
    const isMobile = useIsMobile();
    const gameCount = isMobile ? 10 : desktopGameCount;
    const visibleTrend = useMemo(() => trend.slice(-gameCount).reduce<Game[]>((games, game) => [
        ...games,
        { ...game, cumulative_points: Number(games.at(-1)?.cumulative_points ?? 0) + Number(game.points) },
    ], []), [trend, gameCount]);
    const apply = (next: Partial<Filters>) => router.get(statusRoute().url, { ...filters, ...next }, { preserveState: true, preserveScroll: true, replace: true });
    const conditionLabel = [periodLabels[filters.period], filters.player_count ? `${filters.player_count}人打ち` : '全ルール', opponents.find((item) => item.id === filters.opponent_id)?.name].filter(Boolean).join('・');
    const chart = useMemo(() => {
        const values = visibleTrend.map((game) => chartMode === 'rank' ? game.rank : chartMode === 'points' ? Number(game.points) : Number(game.cumulative_points ?? 0));
        if (!values.length) return { points: '', dots: [] as { x: number; y: number }[], yTicks: [] as { value: number; y: number }[], xTicks: [] as { label: string; x: number }[] };
        const width = 720, height = 270, left = 92, right = 18, top = 18, bottom = 46;
        const min = chartMode === 'rank' ? 1 : Math.min(0, ...values);
        const max = chartMode === 'rank' ? 4 : Math.max(0, ...values);
        const range = Math.max(max - min, 1);
        const dots = values.map((value, index) => ({
            x: left + (values.length === 1 ? (width - left - right) / 2 : index / (values.length - 1) * (width - left - right)),
            y: top + ((chartMode === 'rank' ? value - min : max - value) / range) * (height - top - bottom),
        }));
        const tickValues = chartMode === 'rank' ? [1, 2, 3, 4] : Array.from({ length: 5 }, (_, index) => min + ((max - min) * index) / 4).reverse();
        const yTicks = tickValues.map((value) => ({ value, y: top + ((chartMode === 'rank' ? value - min : max - value) / range) * (height - top - bottom) }));
        const tickIndexes = Array.from(new Set([0, Math.floor((values.length - 1) / 4), Math.floor((values.length - 1) / 2), Math.floor(((values.length - 1) * 3) / 4), values.length - 1]));
        const xTicks = tickIndexes.map((index) => ({ label: `${index + 1}戦`, x: dots[index].x }));
        return { dots, yTicks, xTicks, points: dots.map((point) => `${point.x},${point.y}`).join(' ') };
    }, [visibleTrend, chartMode]);

    const primaryMetrics = [
        ['平均順位', summary.average_rank === null ? '—' : `${nf.format(summary.average_rank)}位`],
        ['平均ポイント', summary.average_points === null ? '—' : `${nf.format(summary.average_points)} pt`],
        ['トップ率', percent(summary.top_rate)],
        ['連対率', percent(summary.top_two_rate)],
        ['ラス率', percent(summary.last_rate)],
        ['対局数', `${summary.total_games}戦`],
    ];

    return <AppLayout breadcrumbs={[{ title: '戦績', href: statusRoute().url }]}>
        <Head title="戦績" />
        <div className="space-y-5">
            <header className="flex items-end justify-between gap-4">
                <div><h1 className="text-2xl font-semibold">戦績</h1><p className="mt-1 text-sm text-muted-foreground">{conditionLabel}</p></div>
                <details className="group relative">
                    <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"><SlidersHorizontal className="size-4" />条件変更</summary>
                    <div className="absolute right-0 z-20 mt-2 w-[min(34rem,calc(100vw-2rem))] rounded-lg border bg-popover p-4 text-popover-foreground shadow-xl">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <label className="space-y-1 text-sm">期間<select className="w-full rounded-md border bg-background px-3 py-2" value={filters.period} onChange={(e) => apply({ period: e.target.value, from: null, to: null })}><option value="all">全期間</option><option value="year">今年</option><option value="month">今月</option><option value="week">今週</option><option value="custom">任意期間</option></select></label>
                            <label className="space-y-1 text-sm">人数<select className="w-full rounded-md border bg-background px-3 py-2" value={filters.player_count ?? ''} onChange={(e) => apply({ player_count: e.target.value ? Number(e.target.value) : null })}><option value="">すべて</option><option value="3">3人打ち</option><option value="4">4人打ち</option></select></label>
                            <label className="space-y-1 text-sm sm:col-span-2">対戦相手<select className="w-full rounded-md border bg-background px-3 py-2" value={filters.opponent_id ?? ''} onChange={(e) => apply({ opponent_id: e.target.value ? Number(e.target.value) : null })}><option value="">すべて</option>{opponents.map((opponent) => <option key={opponent.id} value={opponent.id}>{opponent.name}</option>)}</select></label>
                            {filters.period === 'custom' && <><label className="space-y-1 text-sm">開始<input type="date" className="w-full rounded-md border bg-background px-3 py-2" value={filters.from ?? ''} onChange={(e) => apply({ from: e.target.value || null })} /></label><label className="space-y-1 text-sm">終了<input type="date" className="w-full rounded-md border bg-background px-3 py-2" value={filters.to ?? ''} onChange={(e) => apply({ to: e.target.value || null })} /></label></>}
                        </div>
                    </div>
                </details>
            </header>

            <Card className="overflow-hidden">
                <CardContent className="p-0">
                    <div className="grid lg:grid-cols-[1.15fr_2fr]">
                        <div className="flex flex-col justify-center border-b bg-muted/35 p-6 lg:border-r lg:border-b-0 sm:p-8">
                            <p className="text-sm text-muted-foreground">累計ポイント</p>
                            <p className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">{nf.format(Number(summary.total_points))}<span className="ml-2 text-xl font-medium">pt</span></p>
                            <p className="mt-3 text-sm text-muted-foreground">{summary.total_sessions}セッション・{summary.total_games}戦</p>
                        </div>
                        <div className="grid grid-cols-2 divide-x divide-y sm:grid-cols-3 sm:divide-y-0">
                            {primaryMetrics.map(([label, value]) => <div key={label} className="flex min-h-24 flex-col justify-center px-4 py-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p></div>)}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
                <Card className="min-w-0 overflow-hidden">
                    <CardHeader className="pb-2"><div className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-2"><div><CardTitle>直近{gameCount}戦の推移</CardTitle><CardDescription>最近の調子を確認できます。</CardDescription></div><div className="hidden rounded-md border p-1 md:flex">{([10,30,50] as const).map((count) => <button key={count} type="button" onClick={() => setDesktopGameCount(count)} className={`rounded px-3 py-1 text-sm ${desktopGameCount === count ? 'bg-primary text-primary-foreground' : ''}`}>{count}戦</button>)}</div></div><div className="flex w-fit max-w-full rounded-md border p-1">{([['rank','順位'],['points','ポイント'],['cumulative','累積']] as const).map(([value,label]) => <button key={value} type="button" onClick={() => setChartMode(value)} className={`rounded px-2.5 py-1 text-xs sm:px-3 sm:text-sm ${chartMode === value ? 'bg-primary text-primary-foreground' : ''}`}>{label}</button>)}</div></div></CardHeader>
                    <CardContent className="min-w-0 px-2 sm:px-6">{visibleTrend.length === 0 ? <p className="py-16 text-center text-sm text-muted-foreground">該当する戦績がありません。</p> : <svg viewBox="0 0 720 270" className="h-auto w-full" role="img" aria-label="戦績推移">{chart.yTicks.map((tick) => <g key={tick.value}><line x1="92" x2="702" y1={tick.y} y2={tick.y} className="stroke-border" strokeDasharray="5 5" strokeWidth="1.5" /><text x="80" y={tick.y + 7} textAnchor="end" className="fill-foreground text-[19px] font-medium">{chartMode === 'rank' ? `${tick.value}位` : nf.format(tick.value)}</text></g>)}<line x1="92" x2="92" y1="18" y2="224" className="stroke-foreground" strokeWidth="2" /><line x1="92" x2="702" y1="224" y2="224" className="stroke-foreground" strokeWidth="2" />{chart.xTicks.map((tick) => <g key={tick.label}><line x1={tick.x} x2={tick.x} y1="224" y2="232" className="stroke-foreground" strokeWidth="2" /><text x={tick.x} y="258" textAnchor="middle" className="fill-foreground text-[18px] font-medium">{tick.label}</text></g>)}<polyline points={chart.points} fill="none" className="stroke-primary" strokeWidth="4" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />{chart.dots.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="5" className="fill-background stroke-primary" vectorEffect="non-scaling-stroke" strokeWidth="3"><title>{`${index + 1}戦目: ${chartMode === 'rank' ? `${visibleTrend[index].rank}位` : `${nf.format(chartMode === 'points' ? Number(visibleTrend[index].points) : Number(visibleTrend[index].cumulative_points))} pt`}`}</title></circle>)}</svg>}</CardContent>
                </Card>

                <Card className="min-w-0 overflow-hidden">
                    <CardHeader className="pb-2"><CardTitle>順位分布</CardTitle></CardHeader>
                    <CardContent className="min-w-0 space-y-3">{[1,2,3,4].map((rank, index) => { const item = detailedStats.rank_rates[rank] ?? { count: 0, rate: 0 }; return <div key={rank}><div className="mb-1 flex justify-between text-sm"><span className={`font-medium ${rankTextColors[index]}`}>{rank}位</span><span>{item.count}戦 <strong className={`ml-2 ${rankTextColors[index]}`}>{percent(item.rate)}</strong></span></div><div className="h-2 overflow-hidden rounded bg-muted"><div className={`h-2 rounded ${rankColors[index]}`} style={{ width: `${item.rate * 100}%` }} /></div></div>})}</CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="pb-3"><CardTitle>詳細</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-6">{[
                    ['半荘最高', detailedStats.best_game_points, 'pt'], ['半荘最低', detailedStats.worst_game_points, 'pt'], ['セッション最高', detailedStats.best_session_points, 'pt'], ['セッション最低', detailedStats.worst_session_points, 'pt'], ['セッション平均', detailedStats.average_session_points, 'pt'], ['飛び率', detailedStats.flying_rate * 100, '%'],
                ].map(([label, value, unit]) => <div key={String(label)}><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-lg font-semibold">{nf.format(Number(value))}<span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span></p></div>)}</CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3"><CardTitle>直近10戦</CardTitle></CardHeader>
                <CardContent className="divide-y p-0">{recentGames.length === 0 ? <p className="p-6 text-sm text-muted-foreground">該当する戦績がありません。</p> : recentGames.map((game) => <div key={game.id} className="flex items-center justify-between gap-4 px-6 py-3"><div><p className="text-sm font-medium">{game.session?.name ?? 'セッション'} <span className="font-normal text-muted-foreground">・{game.session?.player_count}人打ち</span></p><p className="text-xs text-muted-foreground">{game.played_at ? df.format(new Date(game.played_at)) : '日時不明'}</p></div><div className="flex items-baseline gap-5"><span className="text-sm">{game.rank}位</span><strong className="min-w-20 text-right">{nf.format(Number(game.points))} pt</strong></div></div>)}</CardContent>
            </Card>
        </div>
    </AppLayout>;
}
