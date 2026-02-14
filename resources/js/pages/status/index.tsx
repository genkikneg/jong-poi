import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { status as statusRoute } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Status',
        href: statusRoute().url,
    },
];

type RecentGame = {
    id: number;
    points: string;
    rank: number;
    final_score: string;
    played_at: string | null;
    session?: {
        id: number;
        name: string | null;
    } | null;
};

type RankTrendPoint = {
    label: string | null;
    rank: number;
    order: number;
};

type DetailedStats = {
    rank_rates: Record<number, { count: number; rate: number }>;
    best_game_points: string;
    worst_game_points: string;
    best_session_points: string;
    worst_session_points: string;
    average_session_points: string;
    flying_rate: number;
};

type Summary = {
    total_points: string;
    total_games: number;
    total_sessions: number;
};

type Props = {
    summary: Summary;
    recentGames: RecentGame[];
    rankTrend: RankTrendPoint[];
    detailedStats: DetailedStats;
};

const numberFormatter = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
});

const formatPoints = (value?: string | number | null) => numberFormatter.format(Number(value ?? 0));

const rankLabels = [1, 2, 3, 4];
const donutColors = ['#fbbf24', '#38bdf8', '#34d399', '#c084fc'];
const donutRadius = 64;
const donutStrokeWidth = 16;
const donutSize = donutRadius * 2 + donutStrokeWidth;
const donutCenter = donutSize / 2;
const chartHeight = 260;
const chartWidth = 640;
const chartPadding = 32;
const chartBandColors = ['#fef3c7', '#e0f2fe', '#d1fae5', '#f3e8ff'];

const normalizeRank = (rank: number) => {
    if (Number.isNaN(rank)) {
        return 4;
    }

    return Math.min(Math.max(rank, 1), 4);
};

const buildLinePoints = (points: RankTrendPoint[]) => {
    if (points.length === 0) {
        return [];
    }

    if (points.length === 1) {
        const x = chartPadding + (chartWidth - chartPadding * 2) / 2;
        const y = chartPadding + ((normalizeRank(points[0].rank) - 1) / 3) * (chartHeight - chartPadding * 2);

        return [{ ...points[0], x, y }];
    }

    return points.map((point, index) => {
        const x = chartPadding + (index / (points.length - 1)) * (chartWidth - chartPadding * 2);
        const y = chartPadding + ((normalizeRank(point.rank) - 1) / 3) * (chartHeight - chartPadding * 2);

        return { ...point, x, y };
    });
};

export default function StatusPage({ summary, recentGames, rankTrend, detailedStats }: Props) {
    const chartPoints = buildLinePoints(rankTrend);
    const polylinePoints = chartPoints.map((point) => `${point.x},${point.y}`).join(' ');

    const chartTicks = rankLabels.map((rank) => ({
        label: `${rank}位`,
        position: chartPadding + ((rank - 1) / 3) * (chartHeight - chartPadding * 2),
    }));

    const rankRateMetrics = rankLabels.map((rank, index) => ({
        title: `${rank}位率`,
        rate: detailedStats.rank_rates[rank]?.rate ?? 0,
        count: detailedStats.rank_rates[rank]?.count ?? 0,
        color: donutColors[index % donutColors.length],
    }));

    const totalRate = rankRateMetrics.reduce((sum, metric) => sum + metric.rate, 0);
    const donutSegments = (() => {
        let currentAngle = -Math.PI / 2;

        return rankRateMetrics.map((metric) => {
            const angleSpan = metric.rate * Math.PI * 2;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angleSpan;
            currentAngle = endAngle;

            return {
                ...metric,
                startAngle,
                endAngle,
            };
        });
    })();

const describeSector = (startAngle: number, endAngle: number) => {
    const start = {
        x: donutCenter + donutRadius * Math.cos(startAngle),
        y: donutCenter + donutRadius * Math.sin(startAngle),
    };
    const end = {
        x: donutCenter + donutRadius * Math.cos(endAngle),
        y: donutCenter + donutRadius * Math.sin(endAngle),
    };
    const largeArcFlag = endAngle - startAngle <= Math.PI ? 0 : 1;

    return `M ${donutCenter} ${donutCenter} L ${start.x} ${start.y} A ${donutRadius} ${donutRadius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
};

    const summaryMetrics = [
        { label: '累計ポイント', value: `${formatPoints(summary.total_points)} pt` },
        { label: '総対局数', value: `${summary.total_games} 戦` },
        { label: '参加セッション', value: `${summary.total_sessions} 件` },
    ];

    const detailMetrics = [
        { label: '1局最高ポイント', value: `${formatPoints(detailedStats.best_game_points)} pt` },
        { label: '1局最低ポイント', value: `${formatPoints(detailedStats.worst_game_points)} pt` },
        { label: '1セッション最高ポイント', value: `${formatPoints(detailedStats.best_session_points)} pt` },
        { label: '1セッション最低ポイント', value: `${formatPoints(detailedStats.worst_session_points)} pt` },
        { label: '1セッション平均ポイント', value: `${formatPoints(detailedStats.average_session_points)} pt` },
        { label: '飛び率', value: `${numberFormatter.format(detailedStats.flying_rate * 100)} %` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Status" />

            <div className="space-y-8">
                <Heading title="Status" description="Review recent performance before your next session" />

                <Card>
                    <CardHeader>
                        <CardTitle>累計スタッツ</CardTitle>
                        <CardDescription>
                            サマリー・順位分布・詳細指標をまとめてひと目で確認できます。
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 lg:grid-cols-3">
                            <section className="space-y-3 rounded-lg border bg-muted/20 p-4">
                                <p className="text-sm font-semibold text-muted-foreground">累計サマリー</p>
                                <div className="space-y-3">
                                    {summaryMetrics.map((metric) => (
                                        <div key={metric.label} className="flex items-baseline justify-between gap-4">
                                            <p className="text-sm text-muted-foreground">{metric.label}</p>
                                            <p className="text-xl font-semibold">{metric.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-3 rounded-lg border bg-muted/20 p-4">
                                <p className="text-sm font-semibold text-muted-foreground">順位分布</p>
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                    <div className="flex items-center justify-center">
                                        <svg
                                            width={donutSize}
                                            height={donutSize}
                                            viewBox={`0 0 ${donutSize} ${donutSize}`}
                                            aria-label="順位分布の円グラフ"
                                        >
                                            {totalRate > 0 ? (
                                                donutSegments.map((segment) =>
                                                    segment.rate > 0 ? (
                                                        <path
                                                            key={segment.title}
                                                            d={describeSector(segment.startAngle, segment.endAngle)}
                                                            fill={segment.color}
                                                        />
                                                    ) : null,
                                                )
                                            ) : (
                                                <circle
                                                    cx={donutCenter}
                                                    cy={donutCenter}
                                                    r={donutRadius}
                                                    fill="hsl(var(--muted))"
                                                    opacity={0.3}
                                                />
                                            )}
                                        </svg>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        {rankRateMetrics.map((metric) => (
                                            <div key={metric.title} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="size-2.5 rounded-full"
                                                        style={{ backgroundColor: metric.color }}
                                                    />
                                                    <span className="text-muted-foreground">{metric.title}</span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">
                                                        {numberFormatter.format(metric.rate * 100)}%
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">{metric.count} 戦</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-3 rounded-lg border bg-muted/20 p-4">
                                <p className="text-sm font-semibold text-muted-foreground">累計詳細戦績</p>
                                <div className="space-y-3">
                                    {detailMetrics.map((metric) => (
                                        <div key={metric.label} className="flex items-baseline justify-between gap-4">
                                            <p className="text-sm text-muted-foreground">{metric.label}</p>
                                            <p className="text-xl font-semibold">{metric.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="overflow-hidden">
                        <CardHeader>
                            <CardTitle>直近10戦の順位推移</CardTitle>
                            <CardDescription>順位が低いほどグラフは上に表示されます。</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {rankTrend.length === 0 ? (
                                <p className="text-sm text-muted-foreground">戦績データがまだありません。</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <svg
                                        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                                        className="h-64 w-full"
                                        role="img"
                                        aria-label="直近10戦の順位推移"
                                    >
                                        <desc>直近の順位推移を折れ線で表示します</desc>
                                        {rankLabels.map((rank, index) => {
                                            const bandHeight = (chartHeight - chartPadding * 2) / rankLabels.length;
                                            const yStart = chartPadding + index * bandHeight;

                                            return (
                                                <rect
                                                    key={`band-${rank}`}
                                                    x={chartPadding}
                                                    y={yStart}
                                                    width={chartWidth - chartPadding * 2}
                                                    height={bandHeight}
                                                    fill={chartBandColors[index]}
                                                    opacity={0.45}
                                                />
                                            );
                                        })}
                                        {chartTicks.map((tick) => (
                                            <g key={tick.label}>
                                                <line
                                                    x1={chartPadding}
                                                    x2={chartWidth - chartPadding}
                                                    y1={tick.position}
                                                    y2={tick.position}
                                                    className="stroke-muted"
                                                    strokeDasharray="4 6"
                                                    strokeWidth={0.8}
                                                />
                                                <text
                                                    x={chartPadding - 18}
                                                    y={tick.position + 4}
                                                    className="fill-muted-foreground text-xs"
                                                >
                                                    {tick.label}
                                                </text>
                                                <text
                                                    x={chartWidth - chartPadding + 10}
                                                    y={tick.position + 4}
                                                    className="fill-muted-foreground text-xs"
                                                >
                                                    {tick.label}
                                                </text>
                                            </g>
                                        ))}
                                        {polylinePoints ? (
                                            <polyline
                                                points={polylinePoints}
                                                fill="none"
                                                stroke="hsl(var(--foreground))"
                                                strokeWidth={4}
                                                strokeLinejoin="round"
                                                strokeLinecap="round"
                                            />
                                        ) : null}
                                        {chartPoints.map((point, index) => (
                                            <circle
                                                key={`${point.label}-${index}`}
                                                cx={point.x}
                                                cy={point.y}
                                                r={6}
                                                className="fill-background stroke-primary"
                                                strokeWidth={3}
                                            />
                                        ))}
                                        <g aria-hidden>
                                            {chartPoints.map((point, index) => (
                                                <text
                                                    key={`order-${index}`}
                                                    x={point.x}
                                                    y={chartHeight - chartPadding / 2}
                                                    className="fill-muted-foreground text-xs"
                                                    textAnchor="middle"
                                                >
                                                    {index + 1}
                                                </text>
                                            ))}
                                        </g>
                                    </svg>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>直近10戦戦績</CardTitle>
                        <CardDescription>最新の対局結果を確認できます。</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentGames.length === 0 ? (
                            <p className="text-sm text-muted-foreground">まだ戦績がありません。</p>
                        ) : (
                            <div className="space-y-3">
                                {recentGames.map((game) => (
                                    <div key={game.id} className="rounded-lg border px-4 py-3">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-sm font-semibold">
                                                    {game.session?.name ?? 'セッション'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {game.played_at ? dateFormatter.format(new Date(game.played_at)) : '日時不明'}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                                <div>
                                                    <p className="text-xs text-muted-foreground">ポイント</p>
                                                    <p className="text-lg font-semibold">
                                                        {formatPoints(game.points)} pt
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">順位</p>
                                                    <p className="text-lg font-semibold">{game.rank}位</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">最終スコア</p>
                                                    <p className="text-lg font-semibold">{formatPoints(game.final_score)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
