import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function RecoverAccountPassword() {
    return (
        <AuthLayout
            title="新しいパスワードを設定"
            description="設定後はそのままログインします"
        >
            <Head title="新しいパスワードを設定" />
            <Form
                action="/recover-account/password"
                method="post"
                resetOnSuccess={['password', 'password_confirmation']}
                className="space-y-5"
            >
                {({ errors, processing }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="password">新しいパスワード</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                autoComplete="new-password"
                                placeholder="Jongpoi!2026"
                            />
                            <InputError message={errors.password} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">
                                新しいパスワード（確認）
                            </Label>
                            <Input
                                id="password_confirmation"
                                name="password_confirmation"
                                type="password"
                                required
                                autoComplete="new-password"
                                placeholder="Jongpoi!2026"
                            />
                        </div>
                        <Button className="w-full" disabled={processing}>
                            パスワードを設定してログイン
                        </Button>
                    </>
                )}
            </Form>
            <p className="mt-5 text-center text-xs text-muted-foreground">
                <TextLink href="/recover-account">
                    別の復旧コードを入力する
                </TextLink>
            </p>
        </AuthLayout>
    );
}
