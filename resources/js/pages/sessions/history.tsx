import { Head, Link, router } from '@inertiajs/react';
import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { history as sessionsHistory } from '@/routes/sessions';

type Item = { id: number; name: string | null; player_count: number; closed_at: string | null; total_points: string; rank: number | null; game_count: number; members: { id: number; name: string; avatar: string | null }[] };
type Pagination = { data: Item[]; current_page: number; last_page: number; prev_page_url: string | null; next_page_url: string | null; total: number };
type Filters = { period: string; player_count: number | null; opponent_id: number | null; query: string; per_page: 10 | 50 | 100 };
type Props = { sessions: Pagination; opponents: { id: number; name: string }[]; filters: Filters };

const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });
const periodLabels: Record<string, string> = { all: '全期間', year: '今年', month: '今月', week: '今週' };

export default function SessionHistoryPage({ sessions, opponents, filters }: Props) {
    const [query, setQuery] = useState(filters.query);
    const apply = (next: Partial<Filters>) => router.get(sessionsHistory().url, { ...filters, ...next }, { preserveState: true, preserveScroll: true, replace: true });
    const opponent = opponents.find((item) => item.id === filters.opponent_id)?.name;
    const conditionLabel = [periodLabels[filters.period], filters.player_count ? `${filters.player_count}人打ち` : '全ルール', opponent, filters.query ? `「${filters.query}」` : null].filter(Boolean).join('・');
    const pageItems: (number | 'ellipsis')[] = Array.from(new Set([
        1,
        ...Array.from({ length: 5 }, (_, index) => sessions.current_page - 2 + index).filter((page) => page > 1 && page < sessions.last_page),
        sessions.last_page,
    ])).sort((left, right) => left - right).flatMap((page, index, pages) => index > 0 && page - pages[index - 1] > 1 ? ['ellipsis', page] : [page]);
    const moveToPage = (page: number) => router.get(sessionsHistory().url, { ...filters, page }, { preserveState: true, preserveScroll: false });

    return <AppLayout breadcrumbs={[{ title: '履歴', href: sessionsHistory().url }]}>
        <Head title="セッション履歴" />
        <div className="space-y-6">
            <header className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">セッション履歴</h1>
                    <p className="mt-1 text-sm text-muted-foreground">{conditionLabel}・{sessions.total}件</p>
                </div>
                <details className="group relative">
                    <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-muted">
                        <SlidersHorizontal className="size-4" />条件変更
                    </summary>
                    <div className="absolute right-0 z-20 mt-2 w-[min(34rem,calc(100vw-2rem))] rounded-lg border bg-popover p-4 text-popover-foreground shadow-xl">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <form className="flex gap-2 sm:col-span-2" onSubmit={(event) => { event.preventDefault(); apply({ query }); }}>
                                <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="セッション名" />
                                <Button type="submit" variant="outline">検索</Button>
                            </form>
                            <label className="space-y-1 text-sm">期間
                                <select className="w-full rounded-md border bg-background px-3 py-2" value={filters.period} onChange={(event) => apply({ period: event.target.value })}>
                                    <option value="all">全期間</option><option value="year">今年</option><option value="month">今月</option><option value="week">今週</option>
                                </select>
                            </label>
                            <label className="space-y-1 text-sm">人数
                                <select className="w-full rounded-md border bg-background px-3 py-2" value={filters.player_count ?? ''} onChange={(event) => apply({ player_count: event.target.value ? Number(event.target.value) : null })}>
                                    <option value="">すべて</option><option value="3">3人打ち</option><option value="4">4人打ち</option>
                                </select>
                            </label>
                            <label className="space-y-1 text-sm sm:col-span-2">対戦相手
                                <select className="w-full rounded-md border bg-background px-3 py-2" value={filters.opponent_id ?? ''} onChange={(event) => apply({ opponent_id: event.target.value ? Number(event.target.value) : null })}>
                                    <option value="">すべて</option>{opponents.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
                                </select>
                            </label>
                            <label className="space-y-1 text-sm sm:col-span-2">1ページの表示件数
                                <select className="w-full rounded-md border bg-background px-3 py-2" value={filters.per_page} onChange={(event) => apply({ per_page: Number(event.target.value) as Filters['per_page'] })}>
                                    <option value="10">10件</option><option value="50">50件</option><option value="100">100件</option>
                                </select>
                            </label>
                        </div>
                    </div>
                </details>
            </header>

            {sessions.data.length === 0 ? <Card><CardContent className="py-10 text-center text-muted-foreground">条件に一致する履歴がありません。</CardContent></Card> : <div className="space-y-4">
                {sessions.data.map((session) => <Card key={session.id}>
                    <CardHeader><CardTitle className="flex flex-col gap-1 text-base sm:flex-row sm:items-center sm:justify-between"><span>{session.name || 'セッション'} / {session.player_count}人打ち</span><span className="text-sm font-normal text-muted-foreground">{session.closed_at ? dateFormatter.format(new Date(session.closed_at)) : '日時不明'}</span></CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">{session.members.map((member) => <Avatar key={member.id} title={member.name} className="size-9"><AvatarImage src={member.avatar ?? undefined} alt={member.name} /><AvatarFallback className="text-xs">{member.name.slice(0, 2)}</AvatarFallback></Avatar>)}</div>
                        <div className="flex flex-wrap items-end justify-between gap-4">
                            <div className="flex gap-8"><div><p className="text-xs text-muted-foreground">合計ポイント</p><p className="text-xl font-semibold">{Number(session.total_points).toLocaleString()} pt</p></div><div><p className="text-xs text-muted-foreground">順位・半荘数</p><p className="text-xl font-semibold">{session.rank ? `${session.rank}位` : '—'}・{session.game_count}戦</p></div></div>
                            <Link href={`/sessions/${session.id}`} className="text-sm font-semibold text-primary">詳細を見る →</Link>
                        </div>
                    </CardContent>
                </Card>)}
            </div>}

            {sessions.last_page > 1 && <nav className="flex flex-wrap items-center justify-center gap-1" aria-label="履歴のページ選択">
                <Button variant="outline" size="sm" onClick={() => moveToPage(sessions.current_page - 1)} disabled={!sessions.prev_page_url}>前へ</Button>
                {pageItems.map((item, index) => item === 'ellipsis' ? <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">…</span> : <Button key={item} size="sm" variant={item === sessions.current_page ? 'default' : 'outline'} onClick={() => moveToPage(item)} aria-current={item === sessions.current_page ? 'page' : undefined}>{item}</Button>)}
                <Button variant="outline" size="sm" onClick={() => moveToPage(sessions.current_page + 1)} disabled={!sessions.next_page_url}>次へ</Button>
            </nav>}
        </div>
    </AppLayout>;
}
