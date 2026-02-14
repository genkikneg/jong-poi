import { Form, Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { create as sessionsCreate, store as sessionsStore } from '@/routes/sessions';
import type { BreadcrumbItem } from '@/types';

type Friend = {
    id: number;
    name: string;
    friend_code: string;
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
    const rankRows = useMemo(() => [1, 2, 3, 4], []);

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

                                    <div className="space-y-4">
                                        <Label>招待するフレンド（{playerCount - 1}人選択）</Label>
                                        <div className="grid gap-2 md:grid-cols-2">
                                            {friends.map((friend) => (
                                                <label
                                                    key={friend.id}
                                                    className="flex items-center gap-3 rounded-lg border px-3 py-2"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        name="member_ids[]"
                                                        value={friend.id}
                                                        className="size-4 rounded border"
                                                    />
                                                    <div>
                                                        <p className="font-medium">{friend.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {friend.friend_code}
                                                        </p>
                                                    </div>
                                                </label>
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
