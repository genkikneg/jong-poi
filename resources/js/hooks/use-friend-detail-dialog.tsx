import { useMemo, useState } from 'react';
import type { FriendDetail } from '@/components/friend-detail-dialog';

export function useFriendDetailDialog(initialFriend: FriendDetail | null = null) {
    const [selectedFriend, setSelectedFriend] = useState<FriendDetail | null>(initialFriend);

    const formatter = useMemo(
        () =>
            new Intl.DateTimeFormat(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
            }),
        [],
    );

    const openFriendDetail = (friend: FriendDetail) => setSelectedFriend(friend);
    const closeFriendDetail = () => setSelectedFriend(null);

    return {
        friendDetailDialogProps: {
            friend: selectedFriend,
            open: Boolean(selectedFriend),
            onOpenChange: (open: boolean) => {
                if (!open) {
                    closeFriendDetail();
                }
            },
            formatter,
        } as const,
        openFriendDetail,
        closeFriendDetail,
    };
}
