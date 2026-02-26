import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';
import { cn } from '@/lib/utils';

const indicatorColors = {
    red: 'bg-red-500',
    green: 'bg-emerald-500',
} as const;

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>メニュー</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            size="lg"
                            className={cn('relative h-14 text-base')}
                            isActive={isCurrentUrl(item.href)}
                            tooltip={{ children: item.title }}
                        >
                            <Link href={item.href} prefetch className="relative flex w-full items-center gap-2">
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                                {item.indicators?.map((indicator, index) =>
                                    indicator.label ? (
                                        <span key={`${item.title}-label-${index}`} className="sr-only">
                                            {indicator.label}
                                        </span>
                                    ) : null,
                                )}
                                {item.indicators && item.indicators.length > 0 && (
                                    <span className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 flex-col gap-1">
                                        {item.indicators.map((indicator, index) => (
                                            <span
                                                key={`${item.title}-indicator-${index}`}
                                                aria-hidden="true"
                                                className={cn(
                                                    'h-2.5 w-2.5 rounded-full shadow-sm ring-2 ring-background dark:ring-slate-900',
                                                    indicatorColors[indicator.color],
                                                )}
                                            />
                                        ))}
                                    </span>
                                )}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
