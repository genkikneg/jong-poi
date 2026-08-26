import { Form, Head, Link, usePage } from '@inertiajs/react';
import { ClipboardList, History, ShieldCheck, Users } from 'lucide-react';
import InputError from '@/components/input-error';
import { OperationsNavigation } from '@/components/operations-navigation';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Props = { verified: boolean };

const breadcrumbs: BreadcrumbItem[] = [
    { title: '運営ツール', href: '/settings/operations' },
];

const tools = [
    {
        title: 'ユーザー復旧',
        description: 'ユーザーを検索して復旧コードを発行します。',
        href: '/settings/operations/users',
        icon: Users,
    },
    {
        title: 'セッション訂正',
        description: 'セッションを検索して対局スコアを訂正します。',
        href: '/settings/operations/sessions',
        icon: ClipboardList,
    },
    {
        title: '操作履歴',
        description: '復旧・訂正の操作履歴を確認します。',
        href: '/settings/operations/audits',
        icon: History,
    },
];

export default function Operations({ verified }: Props) {
    const { flash } = usePage().props as { flash?: { status?: string | null } };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="運営ツール" />
            <div className="mx-auto max-w-3xl space-y-6">
                <OperationsNavigation />
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="size-5" /> 運営ツール
                        </CardTitle>
                        <CardDescription>
                            重要な操作は運営用パスワードで保護されています。
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {flash?.status && (
                            <p className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
                                {flash.status}
                            </p>
                        )}
                        {verified ? (
                            <p className="text-sm text-emerald-700 dark:text-emerald-400">
                                運営モードは一時的に有効です。重要操作では運営用パスワードを再入力してください。
                            </p>
                        ) : (
                            <Form
                                action="/settings/operations/verify"
                                method="post"
                                resetOnSuccess={['operations_password']}
                                className="space-y-3"
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
                                                autoComplete="off"
                                                required
                                                placeholder="Jongpoi!2026"
                                            />
                                            <InputError
                                                message={
                                                    errors.operations_password
                                                }
                                            />
                                        </div>
                                        <Button disabled={processing}>
                                            運営モードを有効にする
                                        </Button>
                                    </>
                                )}
                            </Form>
                        )}
                    </CardContent>
                </Card>
                <div className="grid gap-4 md:grid-cols-3">
                    {tools.map((tool) => (
                        <Card key={tool.href}>
                            <CardHeader>
                                <tool.icon className="size-5 text-primary" />
                                <CardTitle className="text-lg">
                                    {tool.title}
                                </CardTitle>
                                <CardDescription>
                                    {tool.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline" asChild>
                                    <Link href={tool.href}>開く</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
