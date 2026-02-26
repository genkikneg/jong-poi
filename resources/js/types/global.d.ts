import type { Auth } from '@/types/auth';
import type { SidebarNotifications } from '@/types/notifications';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            notifications: SidebarNotifications;
            [key: string]: unknown;
        };
    }
}
