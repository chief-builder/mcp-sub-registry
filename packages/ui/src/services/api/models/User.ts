/* MCP Registry user */

export type User = {
    id: string;
    email: string;
    username: string;
    roles: string[];
    is_active: boolean;
    created_at: string;
    updated_at?: string;
    last_login?: string | null;
    auth_provider?: string;
    metadata?: Record<string, any>;
    // Present on admin user endpoints.
    servers_published?: number;
};
