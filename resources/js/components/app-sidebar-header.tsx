import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const pageTitle = breadcrumbs.at(-1)?.title ?? 'Dashboard';

    return (
        <header className="relative flex h-16 shrink-0 items-center gap-4 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-3">
                <SidebarTrigger className="-ml-1" />
                <Link
                    href={dashboard()}
                    prefetch
                    className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-card-foreground transition hover:bg-muted"
                    aria-label="ダッシュボードに戻る"
                >
                    <AppLogoIcon />
                </Link>
            </div>

            {pageTitle && (
                <div className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground md:block">
                    {pageTitle}
                </div>
            )}

            <div className="ml-auto">
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
        </header>
    );
}
