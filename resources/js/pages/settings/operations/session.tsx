import { Form, Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { OperationsNavigation } from '@/components/operations-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Props = {
    session: {
        id: number;
        name: string | null;
        games: {
            id: number;
            ordinal: number;
            played_at: string | null;
            results: {
                user_id: number;
                name: string;
                final_score: string;
                rank: number;
            }[];
        }[];
    };
};

type Errors = Record<string, string>;

function CorrectionErrors({
    errors,
    shouldScroll,
}: {
    errors: Errors;
    shouldScroll: boolean;
}) {
    const errorRef = useRef<HTMLDivElement>(null);
    const resultError =
        errors.results ??
        Object.entries(errors).find(([field]) =>
            field.startsWith('results.'),
        )?.[1];
    const errorMessage = errors.reason ?? resultError;

    useEffect(() => {
        if (shouldScroll && errorMessage) {
            requestAnimationFrame(() =>
                errorRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                }),
            );
        }
    }, [errorMessage, shouldScroll]);

    return (
        <div ref={errorRef}>
            <InputError message={resultError} />
        </div>
    );
}

export default function OperationsSession({ session }: Props) {
    const [submittedGameId, setSubmittedGameId] = useState<number | null>(null);
    const breadcrumbs: BreadcrumbItem[] = [
        { title: '運営ツール', href: '/settings/operations' },
        { title: 'セッション訂正', href: '/settings/operations/sessions' },
        {
            title: session.name || '名称未設定',
            href: `/settings/operations/sessions/${session.id}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="セッション訂正" />
            <div className="mx-auto max-w-3xl space-y-6">
                <OperationsNavigation />
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {session.name || '名称未設定'} の訂正
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {session.games.map((game) => (
                            <Form
                                key={game.id}
                                action={`/settings/operations/games/${game.id}`}
                                method="patch"
                                onStart={() => setSubmittedGameId(game.id)}
                                onSuccess={() => setSubmittedGameId(null)}
                                className="space-y-3 rounded-md border p-4"
                            >
                                {({ errors, processing }) => (
                                    <>
                                        <p className="font-medium">
                                            第{game.ordinal}回
                                        </p>
                                        <input
                                            type="hidden"
                                            name="played_at"
                                            value={game.played_at ?? ''}
                                        />
                                        {game.results.map((result, index) => (
                                            <div
                                                key={result.user_id}
                                                className="grid grid-cols-[1fr_7rem] items-center gap-3"
                                            >
                                                <Label>{result.name}</Label>
                                                <>
                                                    <input
                                                        type="hidden"
                                                        name={`results[${index}][user_id]`}
                                                        value={result.user_id}
                                                    />
                                                    <Input
                                                        name={`results[${index}][final_score]`}
                                                        type="number"
                                                        step="100"
                                                        required
                                                        defaultValue={
                                                            result.final_score
                                                        }
                                                    />
                                                </>
                                            </div>
                                        ))}
                                        <div className="grid gap-2">
                                            <Label>訂正理由</Label>
                                            <Input
                                                name="reason"
                                                required
                                                placeholder="入力ミスの訂正"
                                            />
                                            <InputError
                                                message={errors.reason}
                                            />
                                        </div>
                                        <CorrectionErrors
                                            errors={errors}
                                            shouldScroll={
                                                submittedGameId === game.id
                                            }
                                        />
                                        <Button disabled={processing}>
                                            訂正を保存する
                                        </Button>
                                    </>
                                )}
                            </Form>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
