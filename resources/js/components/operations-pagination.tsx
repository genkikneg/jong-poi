import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

type Props = {
    currentPage: number;
    lastPage: number;
    previousPageUrl: string | null;
    nextPageUrl: string | null;
};

export function OperationsPagination({
    currentPage,
    lastPage,
    previousPageUrl,
    nextPageUrl,
}: Props) {
    if (lastPage <= 1) {
        return null;
    }

    return (
        <div className="flex items-center justify-between gap-3 text-sm">
            {previousPageUrl ? (
                <Button variant="outline" size="sm" asChild>
                    <Link href={previousPageUrl}>前へ</Link>
                </Button>
            ) : (
                <Button variant="outline" size="sm" disabled>
                    前へ
                </Button>
            )}
            <span>
                {currentPage} / {lastPage} ページ
            </span>
            {nextPageUrl ? (
                <Button variant="outline" size="sm" asChild>
                    <Link href={nextPageUrl}>次へ</Link>
                </Button>
            ) : (
                <Button variant="outline" size="sm" disabled>
                    次へ
                </Button>
            )}
        </div>
    );
}
