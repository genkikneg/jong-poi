import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export type FriendDetailRecentGame = {
    id: number;
    points: string;
    rank: number;
    played_at: string | null;
    session?: {
        id: number;
        name: string | null;
    } | null;
};

export type FriendRelationStatus = 'self' | 'friend' | 'pending_outgoing' | 'pending_incoming' | 'none';

export type FriendDetail = {
    id: number;
    name: string;
    friend_code: string;
    avatar?: string | null;
    stats?: {
        total_points: string;
        recent_games: FriendDetailRecentGame[];
    } | null;
    relation_status?: FriendRelationStatus;
};

type FriendDetailDialogProps = {
    friend: FriendDetail | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    formatter: Intl.DateTimeFormat;
    onSendRequest?: (friend: FriendDetail) => void;
    sending?: boolean;
};

const formatPoints = (value?: string | number | null) =>
    Number(value ?? 0).toLocaleString(undefined, {
        maximumFractionDigits: 1,
        minimumFractionDigits: 0,
    });

const getInitials = (name: string) =>
    name
        .trim()
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

export function FriendDetailDialog({ friend, open, onOpenChange, formatter, onSendRequest, sending = false }: FriendDetailDialogProps) {
    const recentGames = friend?.stats?.recent_games ?? [];
    const relation = friend?.relation_status ?? 'friend';

    const canSendRequest = relation === 'none' && Boolean(onSendRequest);

    const relationMessage = (() => {
        switch (relation) {
            case 'self':
                return 'これはあなた自身の情報です。';
            case 'friend':
                return '既にフレンドになっています。';
            case 'pending_outgoing':
                return 'フレンド申請を送信済みです。相手の承認をお待ちください。';
            case 'pending_incoming':
                return '相手からのフレンド申請が保留中です。Friendsページで承認してください。';
            default:
                return 'まだフレンドではありません。';
        }
    })();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>フレンド詳細</DialogTitle>
                    <DialogDescription>累計ポイントと直近10戦の記録を確認できます。</DialogDescription>
                </DialogHeader>

                {friend && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <Avatar className="size-16">
                                {friend.avatar && <AvatarImage src={friend.avatar} alt={friend.name} />}
                                <AvatarFallback>{getInitials(friend.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-lg font-semibold">{friend.name}</p>
                                <p className="text-sm text-muted-foreground">コード：{friend.friend_code}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">累計ポイント</p>
                            <p className="text-3xl font-semibold">{formatPoints(friend.stats?.total_points)} pt</p>
                        </div>

                        <div className="space-y-3">
                            <p className="text-sm font-semibold">直近10戦</p>
                            {recentGames.length ? (
                                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                                    {recentGames.map((entry) => {
                                        const pointsValue = Number(entry.points ?? 0);
                                        const trendClass =
                                            pointsValue > 0
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
                                                    {entry.played_at ? formatter.format(new Date(entry.played_at)) : '日時不明'}
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

                        <div className="space-y-2 rounded-md border bg-muted/50 p-3 text-sm">
                            <p>{relationMessage}</p>
                            {canSendRequest && friend && (
                                <Button
                                    type="button"
                                    className="mt-2"
                                    disabled={sending}
                                    onClick={() => onSendRequest?.(friend)}
                                >
                                    {sending ? '送信中…' : 'フレンド申請を送る'}
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
