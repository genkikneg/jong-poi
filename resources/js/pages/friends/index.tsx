import { Form, Head } from '@inertiajs/react';
import { Copy, UserRoundPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { index as friendsIndex } from '@/routes/friends';
import { accept as acceptFriendRequest, destroy as destroyFriendRequest, store as sendFriendRequest } from '@/routes/friend-requests';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

type Friend = {
    id: number;
    name: string;
    friend_code: string;
    avatar: string;
    stats?: {
        total_points: string;
        recent_games: Array<{
            id: number;
            points: string;
            rank: number;
            played_at: string | null;
            session?: {
                id: number;
                name: string | null;
            } | null;
        }>;
    };
};

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
        title: 'Friends',
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
    const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(friendCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy friend code', error);
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

    const formatPoints = (value?: string | number | null) =>
        Number(value ?? 0).toLocaleString(undefined, {
            maximumFractionDigits: 1,
            minimumFractionDigits: 0,
        });

    const recentGames = selectedFriend?.stats?.recent_games ?? [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Friends" />

            <div className="space-y-8">
                <Heading
                    title="Friends & invites"
                    description="Share your code, add friends, and manage invitations before starting a session"
                />

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <UserRoundPlus className="size-5" />
                            Add a friend by code
                        </CardTitle>
                        <CardDescription>
                            自分のフレンドコードを共有するか、相手のコードを入力してリクエストを送信します。
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col gap-4 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Your friend code</p>
                                <p className="font-mono text-2xl font-semibold tracking-wide">{friendCode}</p>
                            </div>

                            <Button type="button" variant="outline" className="sm:w-auto" onClick={handleCopyCode} disabled={copied}>
                                <Copy className="size-4" />
                                {copied ? 'Copied' : 'Copy code'}
                            </Button>
                        </div>

                        <Form {...sendFriendRequest.form()} resetOnSuccess={['friend_code']} className="space-y-4">
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
                                        <div className="grid gap-2">
                                            <Label htmlFor="friend_code">Friend code</Label>
                                            <Input
                                                id="friend_code"
                                                name="friend_code"
                                                placeholder="e.g. H5KD92PQ"
                                                autoComplete="off"
                                                maxLength={12}
                                                required
                                            />
                                            <InputError message={errors.friend_code} />
                                        </div>

                                        <Button type="submit" className="w-full sm:w-auto" disabled={processing}>
                                            Send request
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
                            <CardTitle>Incoming requests</CardTitle>
                            <CardDescription>承認待ちのリクエスト。参加してほしい友だちだけ承認してください。</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {incomingRequests.length === 0 && (
                                <p className="text-sm text-muted-foreground">No pending requests right now.</p>
                            )}

                            {incomingRequests.map((request) => (
                                <div key={request.id} className="rounded-lg border p-4">
                                    <div className="flex flex-col gap-1">
                                        <p className="font-medium">{request.sender?.name}</p>
                                        <p className="text-sm text-muted-foreground">Code: {request.sender?.friend_code}</p>
                                        {request.created_at && (
                                            <p className="text-xs text-muted-foreground">
                                                Sent {formatter.format(new Date(request.created_at))}
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                        <Form {...acceptFriendRequest.form(request.id)}>
                                            {({ processing }) => (
                                                <Button type="submit" className="w-full sm:w-auto" disabled={processing}>
                                                    Accept
                                                </Button>
                                            )}
                                        </Form>

                                        <Form {...destroyFriendRequest.form(request.id)}>
                                            {({ processing }) => (
                                                <Button type="submit" variant="outline" className="w-full sm:w-auto" disabled={processing}>
                                                    Decline
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
                            <CardTitle>Outgoing requests</CardTitle>
                            <CardDescription>まだ承認されていないリクエスト。取り消したい場合はキャンセルできます。</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {outgoingRequests.length === 0 && (
                                <p className="text-sm text-muted-foreground">No outgoing requests.</p>
                            )}

                            {outgoingRequests.map((request) => (
                                <div key={request.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="font-medium">{request.recipient?.name}</p>
                                        <p className="text-sm text-muted-foreground">Code: {request.recipient?.friend_code}</p>
                                        {request.created_at && (
                                            <p className="text-xs text-muted-foreground">
                                                Sent {formatter.format(new Date(request.created_at))}
                                            </p>
                                        )}
                                    </div>

                                    <Form {...destroyFriendRequest.form(request.id)}>
                                        {({ processing }) => (
                                            <Button type="submit" variant="ghost" className="w-full sm:w-auto" disabled={processing}>
                                                Cancel request
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
                        <CardTitle>Friends list</CardTitle>
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
                                            onClick={() => setSelectedFriend(friend)}
                                            className="flex w-full items-center gap-4 text-left"
                                        >
                                            <Avatar className="size-12">
                                                <AvatarImage src={friend.avatar} alt={friend.name} />
                                                <AvatarFallback>{getInitials(friend.name)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="font-medium">{friend.name}</p>
                                                <p className="text-sm text-muted-foreground">Code: {friend.friend_code}</p>
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

            <Dialog open={Boolean(selectedFriend)} onOpenChange={(open) => !open && setSelectedFriend(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>フレンド詳細</DialogTitle>
                        <DialogDescription>累計ポイントと直近10戦の記録を確認できます。</DialogDescription>
                    </DialogHeader>

                    {selectedFriend && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="size-16">
                                    <AvatarImage src={selectedFriend.avatar} alt={selectedFriend.name} />
                                    <AvatarFallback>{getInitials(selectedFriend.name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-lg font-semibold">{selectedFriend.name}</p>
                                    <p className="text-sm text-muted-foreground">Code: {selectedFriend.friend_code}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">累計ポイント</p>
                                <p className="text-3xl font-semibold">
                                    {formatPoints(selectedFriend.stats?.total_points)} pt
                                </p>
                            </div>

                            <div className="space-y-3">
                                <p className="text-sm font-semibold">直近10戦</p>
                                {recentGames.length ? (
                                    <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                                        {recentGames.map((entry) => {
                                            const pointsValue = Number(entry.points ?? 0);
                                            const trendClass = pointsValue > 0
                                                ? 'text-emerald-600'
                                                : pointsValue < 0
                                                  ? 'text-rose-600'
                                                  : 'text-muted-foreground';

                                            return (
                                                <div key={entry.id} className="rounded-lg border p-3">
                                                    <div className="flex items-center justify-between gap-2 text-sm font-medium">
                                                        <span>{entry.session?.name ?? 'セッション'}</span>
                                                        <span className={cn('font-semibold', trendClass)}>
                                                            {formatPoints(entry.points)} pt
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {entry.played_at
                                                            ? formatter.format(new Date(entry.played_at))
                                                            : '日時不明'}
                                                        {' ・ '}
                                                        {entry.rank}位
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">まだ対局データがありません。</p>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
