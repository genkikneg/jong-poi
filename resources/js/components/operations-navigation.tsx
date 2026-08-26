import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

const links = [
    { title: '運営トップ', href: '/settings/operations' },
    { title: 'ユーザー復旧', href: '/settings/operations/users' },
    { title: 'セッション訂正', href: '/settings/operations/sessions' },
    { title: '操作履歴', href: '/settings/operations/audits' },
];

export function OperationsNavigation() {
    return (
        <nav className="flex flex-wrap gap-2" aria-label="運営ツール">
            {links.map((link) => (
                <Button key={link.href} variant="outline" size="sm" asChild>
                    <Link href={link.href}>{link.title}</Link>
                </Button>
            ))}
        </nav>
    );
}
