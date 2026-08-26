import { Link, usePage } from '@inertiajs/react';
import { BarChart3, LayoutGrid, Settings, Trophy, Users } from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import { dashboard, status as statusRoute } from '@/routes';
import { index as friendsIndex } from '@/routes/friends';
import { edit as editProfile } from '@/routes/profile';
import type { NavIndicator, NavItem, SidebarNotifications } from '@/types';
import AppLogo from './app-logo';

const defaultNotifications: SidebarNotifications = {
    friendRequests: 0,
    sessionInvites: 0,
    hasActiveSession: false,
};

const footerNavItems: NavItem[] = [
    {
        title: 'Settings',
        href: editProfile(),
        icon: Settings,
    },
];

export function AppSidebar() {
    const { notifications: notificationsProp } = usePage().props as {
        notifications?: SidebarNotifications;
    };

    const notifications = notificationsProp ?? defaultNotifications;

    const dashboardIndicators: NavIndicator[] = [];

    if (notifications.sessionInvites > 0) {
        dashboardIndicators.push({
            color: 'red',
            label: 'セッションへの招待があります',
        });
    }

    if (notifications.hasActiveSession) {
        dashboardIndicators.push({
            color: 'green',
            label: '参加中のセッションがあります',
        });
    }

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
            indicators: dashboardIndicators,
        },
        {
            title: 'Friends',
            href: friendsIndex(),
            icon: Users,
            indicators:
                notifications.friendRequests > 0
                    ? [{ color: 'red', label: '新しいフレンド申請があります' }]
                    : undefined,
        },
        {
            title: 'Rankings',
            href: '/rankings',
            icon: Trophy,
        },
        {
            title: 'Stats',
            href: statusRoute(),
            icon: BarChart3,
        },
    ];

    return (
        <>
            <Sidebar collapsible="icon" variant="inset">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link href={dashboard()} prefetch>
                                    <AppLogo />
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent>
                    <NavMain items={mainNavItems} />
                </SidebarContent>

                <SidebarFooter>
                    {footerNavItems.length > 0 && (
                        <NavFooter items={footerNavItems} className="mt-auto" />
                    )}
                </SidebarFooter>
            </Sidebar>
            <MobileBottomNav items={[...mainNavItems, ...footerNavItems]} />
        </>
    );
}

function MobileBottomNav({ items }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <nav
            aria-label="モバイルナビゲーション"
            className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-lg backdrop-blur md:hidden"
        >
            <div className="flex h-18 items-stretch justify-around">
                {items.map((item) => {
                    const active = isCurrentUrl(item.href);

                    return (
                        <Link
                            key={item.title}
                            href={item.href}
                            prefetch
                            aria-current={active ? 'page' : undefined}
                            className={cn(
                                'relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 text-[10px] font-medium transition-colors',
                                active
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            {item.icon && (
                                <item.icon
                                    className={cn(
                                        'transition-[width,height,stroke-width] duration-200',
                                        active
                                            ? 'size-7 stroke-[2.5]'
                                            : 'size-5',
                                    )}
                                />
                            )}
                            <span className="truncate">{item.title}</span>
                            {item.indicators && item.indicators.length > 0 && (
                                <span
                                    aria-hidden="true"
                                    className="absolute top-2 right-1/2 size-2 translate-x-3 rounded-full bg-red-500 ring-2 ring-background"
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
