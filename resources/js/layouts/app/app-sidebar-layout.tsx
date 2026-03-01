import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { PageRefreshButton } from '@/components/page-refresh-button';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    const currentPageHref = breadcrumbs[breadcrumbs.length - 1]?.href;

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
                    {children}
                </div>
                <PageRefreshButton href={currentPageHref} />
            </AppContent>
        </AppShell>
    );
}
