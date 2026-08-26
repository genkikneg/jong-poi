import { Transition } from '@headlessui/react';
import { Form, Head, usePage } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

export default function Profile() {
    const { auth } = usePage().props;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        encType="multipart/form-data"
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <div className="space-y-2">
                                    <Label>プロフィール画像</Label>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <Avatar className="h-20 w-20">
                                            {auth.user.avatar && (
                                                <AvatarImage
                                                    src={auth.user.avatar}
                                                    alt={auth.user.name}
                                                />
                                            )}
                                            <AvatarFallback>
                                                {auth.user.name
                                                    ?.slice(0, 2)
                                                    .toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-2">
                                            <Input
                                                id="avatar"
                                                name="avatar"
                                                type="file"
                                                accept="image/*"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                JPG, PNG などの画像 (最大 2MB)
                                            </p>
                                            <InputError
                                                message={errors.avatar}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="name">名前</Label>

                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.name}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="ジャンポイ太郎"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="user_id">ユーザーID</Label>

                                    <Input
                                        id="user_id"
                                        type="text"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.user_id}
                                        name="user_id"
                                        required
                                        autoComplete="username"
                                        placeholder="jongpoi_taro"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.user_id}
                                    />
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                    >
                                        保存する
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">
                                            保存しました
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
