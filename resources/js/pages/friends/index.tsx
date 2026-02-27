import { Form, Head } from '@inertiajs/react';
import { Copy, UserRoundPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FriendDetailDialog, type FriendDetail } from '@/components/friend-detail-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { index as friendsIndex } from '@/routes/friends';
import { accept as acceptFriendRequest, destroy as destroyFriendRequest, store as sendFriendRequest } from '@/routes/friend-requests';
import type { BreadcrumbItem } from '@/types';
import { useFriendDetailDialog } from '@/hooks/use-friend-detail-dialog';

type Friend = FriendDetail;

type FriendRequestSummary = {
    id: number;
    created_at: string | null;
    sender?: Friend;
    recipient?: Friend;
};

type Props = {
    friendCode: string;
    friends: Friend[];
    incomingRequests: FriendRequestSummary[];
    outgoingRequests: FriendRequestSummary[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Frends',
        href: friendsIndex().url,
    },
];

const useTimestamp = () =>
    useMemo(
        () =>
            new Intl.DateTimeFormat(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
            }),
        [],
    );

export default function FriendsPage({ friendCode, friends, incomingRequests, outgoingRequests }: Props) {
    const formatter = useTimestamp();
    const [copied, setCopied] = useState(false);
    const { friendDetailDialogProps, openFriendDetail } = useFriendDetailDialog();

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(friendCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('フレンドコードのコピーに失敗しました', error);
        }
    };

    const getInitials = (name: string) => {
        if (!name) {
            return '?';
        }

        return name
            .trim()
            .split(' ')
            .map((part) => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Frends" />

            <div className="space-y-8">
                <Heading
                    title="Frends & invites"
                    description="コードを共有してフレンドを追加し、セッション開始前に招待状況を整えましょう"
                />

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <UserRoundPlus className="size-5" />
                            フレンドコードで追加
                        </CardTitle>
                        <CardDescription>
                            自分のフレンドコードを共有するか、相手のコードを入力してリクエストを送信します。
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col gap-4 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">あなたのフレンドコード</p>
                                <p className="font-mono text-2xl font-semibold tracking-wide">{friendCode}</p>
                            </div>

                            <Button type="button" variant="outline" className="sm:w-auto" onClick={handleCopyCode} disabled={copied}>
                                <Copy className="size-4" />
                                {copied ? 'コピーしました' : 'コードをコピー'}
                            </Button>
                        </div>

                        <Form {...sendFriendRequest.form()} resetOnSuccess={['friend_code']} className="space-y-4">
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
                                        <div className="grid gap-2">
                                            <Label htmlFor="friend_code">フレンドコード</Label>
                                            <Input
                                                id="friend_code"
                                                name="friend_code"
                                                placeholder="例: H5KD92PQ"
                                                autoComplete="off"
                                                maxLength={12}
                                                required
                                            />
                                            <InputError message={errors.friend_code} />
                                        </div>

                                        <Button type="submit" className="w-full sm:w-auto" disabled={processing}>
                                            リクエストを送信
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>受信中のリクエスト</CardTitle>
                            <CardDescription>承認待ちのリクエスト。参加してほしい友だちだけ承認してください。</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {incomingRequests.length === 0 && (
                                <p className="text-sm text-muted-foreground">現在保留中のリクエストはありません。</p>
                            )}

                            {incomingRequests.map((request) => (
                                <div key={request.id} className="rounded-lg border p-4">
                                    <div className="flex flex-col gap-1">
                                        <p className="font-medium">{request.sender?.name}</p>
                                        <p className="text-sm text-muted-foreground">コード：{request.sender?.friend_code}</p>
                                        {request.created_at && (
                                            <p className="text-xs text-muted-foreground">
                                                送信: {formatter.format(new Date(request.created_at))}
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                        <Form {...acceptFriendRequest.form(request.id)}>
                                            {({ processing }) => (
                                                <Button type="submit" className="w-full sm:w-auto" disabled={processing}>
                                                    承認する
                                                </Button>
                                            )}
                                        </Form>

                                        <Form {...destroyFriendRequest.form(request.id)}>
                                            {({ processing }) => (
                                                <Button type="submit" variant="outline" className="w-full sm:w-auto" disabled={processing}>
                                                    辞退する
                                                </Button>
                                            )}
                                        </Form>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>送信済みのリクエスト</CardTitle>
                            <CardDescription>まだ承認されていないリクエスト。取り消したい場合はキャンセルできます。</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {outgoingRequests.length === 0 && (
                                <p className="text-sm text-muted-foreground">送信済みのリクエストはありません。</p>
                            )}

                            {outgoingRequests.map((request) => (
                                <div key={request.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="font-medium">{request.recipient?.name}</p>
                                        <p className="text-sm text-muted-foreground">コード：{request.recipient?.friend_code}</p>
                                        {request.created_at && (
                                            <p className="text-xs text-muted-foreground">
                                                送信: {formatter.format(new Date(request.created_at))}
                                            </p>
                                        )}
                                    </div>

                                    <Form {...destroyFriendRequest.form(request.id)}>
                                        {({ processing }) => (
                                            <Button type="submit" variant="ghost" className="w-full sm:w-auto" disabled={processing}>
                                                リクエストを取り消す
                                            </Button>
                                        )}
                                    </Form>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>フレンド一覧</CardTitle>
                        <CardDescription>追加済みの友だち。セッション作成時にこのリストから招待できます。</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {friends.length === 0 ? (
                            <p className="text-sm text-muted-foreground">まだフレンドがいません。コードを共有して追加しましょう。</p>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {friends.map((friend) => (
                                    <div key={friend.id} className="rounded-lg border p-4">
                        <button
                            type="button"
                            onClick={() => openFriendDetail(friend)}
                            className="flex w-full items-center gap-4 text-left"
                        >
                                            <Avatar className="size-12">
                                                <AvatarImage src={friend.avatar} alt={friend.name} />
                                                <AvatarFallback>{getInitials(friend.name)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="font-medium">{friend.name}</p>
                                                <p className="text-sm text-muted-foreground">コード：{friend.friend_code}</p>
                                            </div>
                                            <span className="text-sm font-semibold text-primary">詳細 →</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <FriendDetailDialog {...friendDetailDialogProps} />
        </AppLayout>
    );
}
