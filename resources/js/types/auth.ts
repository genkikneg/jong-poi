export type User = {
    id: number;
    name: string;
    user_id: string;
    requires_user_id_change: boolean;
    is_operations_admin: boolean;
    avatar?: string | null;
    friend_code: string;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};
