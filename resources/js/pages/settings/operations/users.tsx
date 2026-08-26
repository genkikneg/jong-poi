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

type User = {
    id: number;
    name: string;
    user_id: string;
    friend_code: string;
};

type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Props = {
    verified: boolean;
    query: string;
    sort: 'user_id' | 'name';
    direction: 'asc' | 'desc';
    users: Paginated<User>;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: '運営ツール', href: '/settings/operations' },
    { title: 'ユーザー復旧', href: '/settings/operations/users' },
];

export default function OperationsUsers({
    verified,
    query,
    sort,
    direction,
    users,
}: Props) {
    const [sortDirection, setSortDirection] = useState(direction);
    const [recoveryTarget, setRecoveryTarget] = useState<User | null>(null);
    const { flash } = usePage().props as {
        flash?: { recovery_code?: string | null };
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="ユーザー復旧" />
            <div className="mx-auto max-w-3xl space-y-6">
                <OperationsNavigation />
                <Card>
                    <CardHeader>
                        <CardTitle>ユーザー検索・復旧</CardTitle>
                        <CardDescription>
                            ユーザーIDまたは名前で検索できます。
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Form
                            action="/settings/operations/users"
                            method="get"
                            className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]"
                        >
                            <Input
                                name="q"
                                defaultValue={query}
                                placeholder="jongpoi_taro または ジャンポイ太郎"
                            />
                            <div className="flex h-9 overflow-hidden rounded-md border bg-background">
                                <select
                                    name="sort"
                                    defaultValue={sort}
                                    aria-label="並び替え項目"
                                    className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
                                >
                                    <option value="user_id">ユーザーID</option>
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
                        {!verified && (
                            <p className="text-sm text-amber-700">
                                復旧コードの発行には、運営トップで運営モードを有効にしてください。
                            </p>
                        )}
                        {flash?.recovery_code && (
                            <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
                                <p className="font-medium">
                                    発行した復旧コード（一度だけ表示）
                                </p>
                                <p className="mt-1 font-mono text-lg tracking-widest">
                                    {flash.recovery_code}
                                </p>
                            </div>
                        )}
                        <div className="space-y-3">
                            {users.data.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
                                >
                                    <div className="text-sm">
                                        <p className="font-medium">
                                            {user.name}
                                        </p>
                                        <p className="text-muted-foreground">
                                            {user.user_id} ・ {user.friend_code}
                                        </p>
                                    </div>
                                    {verified && (
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                setRecoveryTarget(user)
                                            }
                                        >
                                            発行
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <OperationsPagination
                            currentPage={users.current_page}
                            lastPage={users.last_page}
                            previousPageUrl={users.prev_page_url}
                            nextPageUrl={users.next_page_url}
                        />
                    </CardContent>
                </Card>
                <Dialog
                    open={recoveryTarget !== null}
                    onOpenChange={(open) => {
                        if (!open) {
                            setRecoveryTarget(null);
                        }
                    }}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>発行</DialogTitle>
                            <DialogDescription>
                                {recoveryTarget
                                    ? `${recoveryTarget.name}（${recoveryTarget.user_id}）の復旧コードを発行します。`
                                    : ''}
                            </DialogDescription>
                        </DialogHeader>
                        {recoveryTarget && (
                            <Form
                                action={`/settings/operations/users/${recoveryTarget.id}/recovery-code`}
                                method="post"
                                resetOnSuccess={['operations_password']}
                                onSuccess={() => setRecoveryTarget(null)}
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
                                                    setRecoveryTarget(null)
                                                }
                                            >
                                                キャンセル
                                            </Button>
                                            <Button disabled={processing}>
                                                発行
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
