import { Form, Head, usePage } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function RecoverAccount() {
    const { flash } = usePage().props as { flash?: { status?: string | null } };

    return (
        <AuthLayout
            title="アカウント復旧"
            description="運営者から受け取った復旧コードを入力してください"
        >
            <Head title="アカウント復旧" />
            <Form
                action="/recover-account/verify"
                method="post"
                resetOnSuccess={['code']}
                className="space-y-5"
            >
                {({ errors, processing }) => (
                    <>
                        {flash?.status && (
                            <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
                                {flash.status}
                            </p>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="code">復旧コード</Label>
                            <Input
                                id="code"
                                name="code"
                                required
                                autoComplete="off"
                                placeholder="A1B2C3D4E5F6"
                            />
                            <InputError message={errors.code} />
                        </div>
                        <Button className="w-full" disabled={processing}>
                            確認する
                        </Button>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
