import { Head, Link } from '@inertiajs/react';
import { ClipboardList, History, Play, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { create as sessionsCreate, history as sessionsHistory, show as sessionsShow } from '@/routes/sessions';
import { view as sessionsJoinView } from '@/routes/sessions/join';
import type { BreadcrumbItem } from '@/types';

type ActiveSessionCard = {
    id: number;
    name: string | null;
    owner: string | null;
    join_code: string;
    player_count: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

const actions = [
    {
        title: 'セッション作成',
        description: 'フレンドを選んでルールを設定。参加コードを共有できます。',
        href: sessionsCreate().url,
        icon: PlusCircle,
        cta: '作成する',
    },
    {
        title: 'セッション参加',
        description: '共有された参加コードを入力して参加します。',
        href: sessionsJoinView().url,
        icon: ClipboardList,
        cta: 'コードを入力',
    },
    {
        title: '自分の履歴',
        description: '参加した半荘のスコアとポイントを確認できます。',
        href: sessionsHistory().url,
        icon: History,
        cta: '履歴を見る',
    },
];

export default function Dashboard({ activeSession = null }: { activeSession?: ActiveSessionCard | null }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="grid gap-6 md:grid-cols-3">
                {activeSession && (
                    <Card className="md:col-span-3 border-primary/40 shadow-lg">
                        <CardHeader>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <div className="text-sm uppercase tracking-wide text-muted-foreground">
                                        参加中のセッション
                                    </div>
                                    <CardTitle>
                                        {activeSession.name || 'セッション'} / {activeSession.player_count}人
                                    </CardTitle>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    ホスト: {activeSession.owner ?? '不明'}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex flex-wrap items-center justify-between gap-4">
                            <div className="font-mono text-lg tracking-widest">
                                CODE: {activeSession.join_code}
                            </div>
                            <Link
                                href={sessionsShow(activeSession.id).url}
                                className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                            >
                                セッションに戻る
                                <Play className="size-4" />
                            </Link>
                        </CardContent>
                    </Card>
                )}
                {actions.map((action) => (
                    <Card key={action.title} className="flex flex-col justify-between">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <action.icon className="size-6 text-primary" />
                                <CardTitle>{action.title}</CardTitle>
                            </div>
                            <CardDescription>{action.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link
                                href={action.href}
                                className="inline-flex items-center text-sm font-semibold text-primary"
                            >
                                {action.cta} →
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </AppLayout>
    );
}
