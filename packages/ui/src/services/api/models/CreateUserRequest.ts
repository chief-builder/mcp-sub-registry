/* MCP Registry admin: create-user request */

export type CreateUserRequest = {
    email: string;
    username: string;
    password?: string;
    roles?: string[];
    is_active?: boolean;
    metadata?: Record<string, any>;
};
