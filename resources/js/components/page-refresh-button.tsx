import { Link, usePage } from '@inertiajs/react';
import { RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
    href?: string | null;
};

export function PageRefreshButton({ href }: Props) {
    const { url } = usePage();
    const refreshHref = href ?? url ?? '/';

    return (
        <Button
            asChild
            size="icon"
            className="fixed bottom-[74px] right-4 z-40 h-10 w-10 rounded-full shadow-lg sm:bottom-[82px] sm:right-8"
        >
            <Link
                href={refreshHref}
                aria-label="このページを更新"
                className="flex size-full items-center justify-center"
            >
                <RotateCw className="size-5" />
            </Link>
        </Button>
    );
}
