import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { history as sessionsHistory } from '@/routes/sessions';
import type { BreadcrumbItem } from '@/types';

type SessionHistoryItem = {
    id: number;
    name: string | null;
    player_count: number;
    closed_at: string | null;
    total_points: string;
    rank: number;
};

type Props = {
    sessions?: SessionHistoryItem[] | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: '履歴',
        href: sessionsHistory().url,
    },
];

const formatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
});

export default function SessionHistoryPage({ sessions }: Props = {}) {
    const sessionItems = Array.isArray(sessions) ? sessions : [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="セッション履歴" />

            <div className="space-y-6">
                <Heading
                    title="セッション履歴"
                    description="終了したセッションごとの合計ポイントと最終順位です"
                />

                {sessionItems.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            まだ履歴がありません。
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {sessionItems.map((session) => (
                            <Card key={session.id}>
                                <CardHeader>
                                    <CardTitle className="flex flex-col gap-1 text-base text-card-foreground md:flex-row md:items-center md:justify-between">
                                        <span>
                                            {session.name || 'セッション'} / {session.player_count}人打ち
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            {session.closed_at ? formatter.format(new Date(session.closed_at)) : '日時不明'}
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">合計ポイント</p>
                                        <p className="text-2xl font-semibold text-card-foreground">
                                            {Number(session.total_points).toLocaleString()} pt
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">最終順位</p>
                                        <p className="text-2xl font-semibold text-card-foreground">{session.rank}位</p>
                                    </div>
                                    <Link href={`/sessions/${session.id}`} className="text-sm font-semibold text-primary">
                                        詳細を見る →
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
