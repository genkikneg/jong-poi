import type { ComponentPropsWithoutRef } from 'react';

import { cn } from '@/lib/utils';

export default function AppLogoIcon({
    className,
    ...props
}: ComponentPropsWithoutRef<'img'>) {
    return (
        <img
            {...props}
            src="/apple-touch-icon.png"
            alt="ジャンポイ"
            className={cn('h-full w-full object-cover', className)}
        />
    );
}
