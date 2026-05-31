/* MCP Registry admin: update-user request (all fields optional) */

export type UpdateUserRequest = {
    email?: string;
    username?: string;
    password?: string;
    roles?: string[];
    is_active?: boolean;
    metadata?: Record<string, any>;
};
