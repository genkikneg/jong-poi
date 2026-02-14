import { Form, Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { join as sessionsJoin, show as sessionsShow } from '@/routes/sessions';
import { view as sessionsJoinView } from '@/routes/sessions/join';
import type { BreadcrumbItem } from '@/types';

type PendingSession = {
    id: number;
    name: string | null;
    owner: string | null;
    join_code: string;
    player_count: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'セッション参加',
        href: sessionsJoinView().url,
    },
];

export default function SessionJoinPage({ pendingSessions = [] }: { pendingSessions?: PendingSession[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="セッション参加" />

            <div className="mx-auto max-w-xl space-y-8">
                <Heading
                    title="参加コードを入力"
                    description="フレンドから共有された参加コードを入力すると、セッション画面に移動できます"
                />

                <Card>
                    <CardHeader>
                        <CardTitle>参加コード</CardTitle>
                        <CardDescription>英数字6桁のコードを入力してください。</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...sessionsJoin.form()} className="space-y-6">
                            {({ processing, errors }) => (
                                <>
                                    <div className="space-y-2">
                                        <Input
                                            id="join_code"
                                            name="join_code"
                                            maxLength={6}
                                            className="text-center text-2xl tracking-[0.3em]"
                                            placeholder="ABC123"
                                            autoComplete="off"
                                            required
                                        />
                                        <InputError message={errors.join_code} />
                                    </div>

                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={processing}>
                                            参加する
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                {pendingSessions.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>自分宛の招待</CardTitle>
                            <CardDescription>ホストがあなたを追加したセッションです。ワンタップで復帰できます。</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {pendingSessions.map((session) => (
                                <div
                                    key={session.id}
                                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
                                >
                                    <div>
                                        <p className="font-medium">{session.name || 'セッション'}</p>
                                        <p className="text-xs text-muted-foreground">
                                            ホスト: {session.owner ?? '不明'} / コード: {session.join_code}
                                        </p>
                                    </div>
                                    <Link href={sessionsShow(session.id).url} className="text-sm font-semibold text-primary">
                                        開く →
                                    </Link>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
