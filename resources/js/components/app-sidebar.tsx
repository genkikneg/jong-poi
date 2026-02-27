import { Link, usePage } from '@inertiajs/react';
import { BarChart3, LayoutGrid, Settings, Trophy, Users } from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
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
        dashboardIndicators.push({ color: 'red', label: 'セッションへの招待があります' });
    }

    if (notifications.hasActiveSession) {
        dashboardIndicators.push({ color: 'green', label: '参加中のセッションがあります' });
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
            title: 'Status',
            href: statusRoute(),
            icon: BarChart3,
        },
    ];

    return (
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
                {footerNavItems.length > 0 && <NavFooter items={footerNavItems} className="mt-auto" />}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
