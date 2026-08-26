import { Form, Head } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <AuthLayout
            title="アカウントを作成"
            description="以下の情報を入力してアカウントを作成してください"
        >
            <Head title="新規登録" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">名前</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="ジャンポイ太郎"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="user_id">ユーザーID</Label>
                                <Input
                                    id="user_id"
                                    type="text"
                                    required
                                    tabIndex={2}
                                    autoComplete="username"
                                    name="user_id"
                                    placeholder="jongpoi_taro"
                                />
                                <p className="text-xs text-muted-foreground">
                                    英数字と _ - . @ +
                                    が使用できます。登録後に変更できます。
                                </p>
                                <InputError message={errors.user_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">パスワード</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        required
                                        tabIndex={3}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="Jongpoi!2026"
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                (visible) => !visible,
                                            )
                                        }
                                        tabIndex={4}
                                        className="absolute top-1/2 right-2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                                        aria-label={
                                            showPassword
                                                ? 'パスワードを隠す'
                                                : 'パスワードを表示する'
                                        }
                                        title={
                                            showPassword
                                                ? 'パスワードを隠す'
                                                : 'パスワードを表示する'
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            <Eye
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    パスワード（確認）
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password_confirmation"
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        required
                                        tabIndex={5}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="Jongpoi!2026"
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                (visible) => !visible,
                                            )
                                        }
                                        tabIndex={6}
                                        className="absolute top-1/2 right-2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                                        aria-label={
                                            showPassword
                                                ? 'パスワードを隠す'
                                                : 'パスワードを表示する'
                                        }
                                        title={
                                            showPassword
                                                ? 'パスワードを隠す'
                                                : 'パスワードを表示する'
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            <Eye
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                        )}
                                    </button>
                                </div>
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={7}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                アカウントを作成
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            すでにアカウントをお持ちですか？{' '}
                            <TextLink href={login()} tabIndex={8}>
                                ログイン
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
