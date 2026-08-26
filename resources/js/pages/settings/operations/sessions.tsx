import { Form, Head, usePage } from '@inertiajs/react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { OperationsNavigation } from '@/components/operations-navigation';
import { OperationsPagination } from '@/components/operations-pagination';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Session = {
    id: number;
    name: string | null;
    join_code: string;
    status: string;
    owner: string | null;
    updated_at: string | null;
    played_at: string | null;
};

type Props = {
    query: string;
    memberUserId: string;
    selectedUser: { name: string; user_id: string } | null;
    playedFrom: string | null;
    playedTo: string | null;
    sort: 'played_at' | 'updated_at' | 'name';
    direction: 'asc' | 'desc';
    sessions: {
        data: Session[];
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: '運営ツール', href: '/settings/operations' },
    { title: 'セッション訂正', href: '/settings/operations/sessions' },
];

export default function OperationsSessions({
    query,
    memberUserId,
    selectedUser,
    playedFrom,
    playedTo,
    sort,
    direction,
    sessions,
}: Props) {
    const [sortDirection, setSortDirection] = useState(direction);
    const [correctionTarget, setCorrectionTarget] = useState<Session | null>(
        null,
    );
    const { flash } = usePage().props as { flash?: { status?: string | null } };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="セッション訂正" />
            <div className="mx-auto max-w-3xl space-y-6">
                <OperationsNavigation />
                <Card>
                    <CardHeader>
                        <CardTitle>セッション検索</CardTitle>
                        <CardDescription>
                            名前・参加コード・ホスト名のほか、参加ユーザーと実施日で絞り込めます。
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Form
                            action="/settings/operations/sessions"
                            method="get"
                            className="grid gap-2 sm:grid-cols-2"
                        >
                            <Input
                                name="q"
                                defaultValue={query}
                                placeholder="初期対局 または AB12CD34"
                            />
                            <Input
                                name="member_user_id"
                                defaultValue={memberUserId}
                                placeholder="含まれるユーザーID"
                            />
                            <Input
                                name="played_from"
                                type="date"
                                defaultValue={playedFrom ?? ''}
                            />
                            <Input
                                name="played_to"
                                type="date"
                                defaultValue={playedTo ?? ''}
                            />
                            <div className="flex h-9 overflow-hidden rounded-md border bg-background">
                                <select
                                    name="sort"
                                    defaultValue={sort}
                                    aria-label="並び替え項目"
                                    className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
                                >
                                    <option value="played_at">実施日</option>
                                    <option value="updated_at">更新日</option>
                                    <option value="name">名前</option>
                                </select>
                                <input
                                    type="hidden"
                                    name="direction"
                                    value={sortDirection}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSortDirection((current) =>
                                            current === 'asc' ? 'desc' : 'asc',
                                        )
                                    }
                                    className="flex w-20 shrink-0 items-center justify-center gap-1 border-l text-xs font-medium hover:bg-muted"
                                    aria-label={`現在: ${sortDirection === 'asc' ? '昇順' : '降順'}。押すと切り替えます`}
                                >
                                    {sortDirection === 'asc' ? (
                                        <ArrowUp className="size-3.5" />
                                    ) : (
                                        <ArrowDown className="size-3.5" />
                                    )}
                                    {sortDirection === 'asc' ? '昇順' : '降順'}
                                </button>
                            </div>
                            <Button variant="outline">検索</Button>
                        </Form>
                        {memberUserId && (
                            <p className="text-sm text-muted-foreground">
                                {selectedUser
                                    ? `参加ユーザー: ${selectedUser.name}（${selectedUser.user_id}）`
                                    : '該当するユーザーIDが見つかりません。'}
                            </p>
                        )}
                        {flash?.status && (
                            <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
                                {flash.status}
                            </p>
                        )}
                        <div className="space-y-3">
                            {sessions.data.map((session) => (
                                <button
                                    key={session.id}
                                    type="button"
                                    onClick={() => setCorrectionTarget(session)}
                                    className="flex w-full items-center justify-between rounded-md border p-3 text-left text-sm hover:bg-muted"
                                >
                                    <span>
                                        {session.name || '名称未設定'} /{' '}
                                        {session.owner || '不明'}
                                        <span className="ml-2 font-mono text-muted-foreground">
                                            {session.join_code}
                                        </span>
                                    </span>
                                    <span className="text-muted-foreground">
                                        {session.played_at
                                            ? new Intl.DateTimeFormat('ja-JP', {
                                                  dateStyle: 'medium',
                                              }).format(
                                                  new Date(session.played_at),
                                              )
                                            : session.status}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <OperationsPagination
                            currentPage={sessions.current_page}
                            lastPage={sessions.last_page}
                            previousPageUrl={sessions.prev_page_url}
                            nextPageUrl={sessions.next_page_url}
                        />
                    </CardContent>
                </Card>
                <Dialog
                    open={correctionTarget !== null}
                    onOpenChange={(open) => {
                        if (!open) {
                            setCorrectionTarget(null);
                        }
                    }}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>セッション訂正</DialogTitle>
                            <DialogDescription>
                                {correctionTarget
                                    ? `${correctionTarget.name || '名称未設定'}を訂正します。`
                                    : ''}
                            </DialogDescription>
                        </DialogHeader>
                        {correctionTarget && (
                            <Form
                                action={`/settings/operations/sessions/${correctionTarget.id}/open`}
                                method="post"
                                resetOnSuccess={['operations_password']}
                                className="space-y-4"
                            >
                                {({ errors, processing }) => (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="operations_password">
                                                運営用パスワード
                                            </Label>
                                            <Input
                                                id="operations_password"
                                                name="operations_password"
                                                type="password"
                                                required
                                                autoComplete="off"
                                                placeholder="Jongpoi!2026"
                                            />
                                            <InputError
                                                message={
                                                    errors.operations_password
                                                }
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    setCorrectionTarget(null)
                                                }
                                            >
                                                キャンセル
                                            </Button>
                                            <Button disabled={processing}>
                                                開く
                                            </Button>
                                        </DialogFooter>
                                    </>
                                )}
                            </Form>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
