import { Form, Head } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { create as sessionsCreate, store as sessionsStore } from '@/routes/sessions';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

type Friend = {
    id: number;
    name: string;
    friend_code: string;
    avatar: string;
};

type Props = {
    friends: Friend[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'セッション作成',
        href: sessionsCreate().url,
    },
];

export default function SessionCreatePage({ friends }: Props) {
    const [playerCount, setPlayerCount] = useState(4);
    const [selectedFriendIds, setSelectedFriendIds] = useState<number[]>([]);
    const [isFriendSelectorOpen, setFriendSelectorOpen] = useState(false);
    const rankRows = useMemo(() => [1, 2, 3, 4], []);
    const selectedFriends = useMemo(
        () => friends.filter((friend) => selectedFriendIds.includes(friend.id)),
        [friends, selectedFriendIds],
    );
    const maxSelectable = Math.max(playerCount - 1, 0);
    const remainingSlots = Math.max(maxSelectable - selectedFriendIds.length, 0);

    useEffect(() => {
        const allowedIds = new Set(friends.map((friend) => friend.id));
        setSelectedFriendIds((prev) => prev.filter((id) => allowedIds.has(id)));
    }, [friends]);

    useEffect(() => {
        setSelectedFriendIds((prev) => {
            if (prev.length <= maxSelectable) {
                return prev;
            }

            return prev.slice(0, maxSelectable);
        });
    }, [maxSelectable]);

    const toggleFriendSelection = (friendId: number) => {
        setSelectedFriendIds((prev) => {
            const exists = prev.includes(friendId);

            if (exists) {
                return prev.filter((id) => id !== friendId);
            }

            if (maxSelectable === 0 || prev.length >= maxSelectable) {
                return prev;
            }

            return [...prev, friendId];
        });
    };

    const getInitials = (name: string) => {
        if (!name) {
            return '?';
        }

        return name.trim().slice(0, 2).toUpperCase();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="セッション作成" />

            <div className="mx-auto max-w-4xl space-y-8">
                <Heading
                    title="セッションを作成"
                    description="参加メンバーとルールを設定して半荘の記録を始めましょう"
                />

                <Card>
                    <CardHeader>
                        <CardTitle>基本情報</CardTitle>
                        <CardDescription>名前や参加人数、ルールを設定してください。</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...sessionsStore.form()} className="space-y-8">
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">セッション名（任意）</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                placeholder="例: 2/12 夜会"
                                                autoComplete="off"
                                            />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="player_count">参加人数</Label>
                                            <select
                                                id="player_count"
                                                name="player_count"
                                                defaultValue={playerCount}
                                                onChange={(event) => setPlayerCount(Number(event.target.value))}
                                                className="rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                            >
                                                <option value={4}>4人打ち</option>
                                                <option value={3}>3人打ち</option>
                                            </select>
                                            <InputError message={errors.player_count} />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                            <div>
                                                <Label>招待するフレンド（最大 {maxSelectable} 人）</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    選択済み {selectedFriendIds.length} / {maxSelectable}
                                                </p>
                                            </div>
                                            <Dialog open={isFriendSelectorOpen} onOpenChange={setFriendSelectorOpen}>
                                                <DialogTrigger asChild>
                                                    <Button type="button" variant="outline" disabled={friends.length === 0}>
                                                        フレンドを選ぶ
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-xl">
                                                    <DialogHeader>
                                                        <DialogTitle>フレンドを選択</DialogTitle>
                                                        <DialogDescription>
                                                            招待したいフレンドをタップして選択・解除できます。
                                                        </DialogDescription>
                                                    </DialogHeader>

                                                    {friends.length === 0 ? (
                                                        <p className="text-sm text-muted-foreground">
                                                            招待できるフレンドがまだいません。まずはフレンドリストから追加してください。
                                                        </p>
                                                    ) : (
                                                        <div className="max-h-[60vh] space-y-2 overflow-y-auto">
                                                            {friends.map((friend) => {
                                                                const selected = selectedFriendIds.includes(friend.id);
                                                                const disabled = !selected && maxSelectable !== 0 && selectedFriendIds.length >= maxSelectable;

                                                                return (
                                                                    <button
                                                                        type="button"
                                                                        key={friend.id}
                                                                        onClick={() => toggleFriendSelection(friend.id)}
                                                                        className={cn(
                                                                            'flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition',
                                                                            selected && 'border-primary bg-primary/10',
                                                                            disabled && 'cursor-not-allowed opacity-60',
                                                                        )}
                                                                        disabled={disabled}
                                                                    >
                                                                        <Avatar className="size-12">
                                                                            <AvatarImage src={friend.avatar} alt={friend.name} />
                                                                            <AvatarFallback>{getInitials(friend.name)}</AvatarFallback>
                                                                        </Avatar>
                                                                        <div className="flex-1">
                                                                            <p className="font-medium">{friend.name}</p>
                                                                            <p className="text-xs text-muted-foreground">{friend.friend_code}</p>
                                                                        </div>
                                                                        <span
                                                                            className={cn(
                                                                                'text-sm font-semibold',
                                                                                selected ? 'text-primary' : 'text-muted-foreground',
                                                                            )}
                                                                        >
                                                                            {selected ? '選択中' : '選択'}
                                                                        </span>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                        <p className="text-sm text-muted-foreground">
                                                            {maxSelectable === 0
                                                                ? '参加人数の設定により招待枠はありません'
                                                                : remainingSlots === 0
                                                                  ? '必要人数をすべて選択済みです'
                                                                  : `あと${remainingSlots}人選べます`}
                                                        </p>
                                                        <DialogClose asChild>
                                                            <Button type="button">完了</Button>
                                                        </DialogClose>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>

                                        {friends.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">
                                                招待可能なフレンドがいません。フレンドページから追加してください。
                                            </p>
                                        ) : selectedFriends.length === 0 ? (
                                            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                                                まだフレンドを選択していません。上の「フレンドを選ぶ」ボタンから招待してください。
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-3">
                                                {selectedFriends.map((friend) => (
                                                    <div key={friend.id} className="flex items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2">
                                                        <Avatar className="size-9">
                                                            <AvatarImage src={friend.avatar} alt={friend.name} />
                                                            <AvatarFallback>{getInitials(friend.name)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-sm font-medium">{friend.name}</p>
                                                            <p className="text-xs text-muted-foreground">{friend.friend_code}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="hidden" aria-hidden="true">
                                            {selectedFriendIds.map((friendId) => (
                                                <input key={friendId} type="hidden" name="member_ids[]" value={friendId} />
                                            ))}
                                        </div>

                                        <InputError message={errors.member_ids} />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="rules_base">基準点 (base)</Label>
                                            <Input
                                                id="rules_base"
                                                name="rules[base]"
                                                type="number"
                                                step="100"
                                                defaultValue={25000}
                                            />
                                            <InputError message={errors['rules.base']} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="rules_k">係数 (k)</Label>
                                            <Input
                                                id="rules_k"
                                                name="rules[k]"
                                                type="number"
                                                step="0.01"
                                                defaultValue={0.1}
                                            />
                                            <InputError message={errors['rules.k']} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>順位ボーナス (rank bonus)</Label>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {rankRows
                                                .filter((rank) => rank <= playerCount)
                                                .map((rank) => (
                                                    <div key={rank} className="space-y-2">
                                                        <Label htmlFor={`rank_bonus_${rank}`}>{rank}位</Label>
                                                        <Input
                                                            id={`rank_bonus_${rank}`}
                                                            name={`rules[rank_bonus][${rank}]`}
                                                            type="number"
                                                            step="100"
                                                            defaultValue={rank === 4 ? -3000 : rank === 3 ? 0 : rank === 2 ? 1000 : 2000}
                                                        />
                                                    </div>
                                                ))}
                                        </div>
                                        <InputError message={errors['rules.rank_bonus']} />
                                    </div>

                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={processing}>
                                            セッションを作成
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
