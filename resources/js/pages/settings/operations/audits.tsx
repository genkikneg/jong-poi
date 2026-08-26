import { Head } from '@inertiajs/react';
import { OperationsNavigation } from '@/components/operations-navigation';
import { OperationsPagination } from '@/components/operations-pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Props = {
    audits: {
        data: {
            id: number;
            action: string;
            target_type: string;
            target_id: number;
            reason: string | null;
            actor: string | null;
            created_at: string | null;
        }[];
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: '運営ツール', href: '/settings/operations' },
    { title: '操作履歴', href: '/settings/operations/audits' },
];

export default function OperationsAudits({ audits }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="操作履歴" />
            <div className="mx-auto max-w-3xl space-y-6">
                <OperationsNavigation />
                <Card>
                    <CardHeader>
                        <CardTitle>操作履歴</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {audits.data.map((audit) => (
                            <div
                                key={audit.id}
                                className="rounded-md border p-3"
                            >
                                <p>
                                    {audit.action} / {audit.target_type} #
                                    {audit.target_id}
                                </p>
                                <p className="text-muted-foreground">
                                    {audit.actor || '不明'}
                                    {audit.reason ? ` ・ ${audit.reason}` : ''}
                                </p>
                            </div>
                        ))}
                        <OperationsPagination
                            currentPage={audits.current_page}
                            lastPage={audits.last_page}
                            previousPageUrl={audits.prev_page_url}
                            nextPageUrl={audits.next_page_url}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
