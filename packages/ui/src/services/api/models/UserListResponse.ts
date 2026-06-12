/* MCP Registry admin users list response */

import type { User } from './User';

export type UserListResponse = {
    users: Array<User>;
    pagination: {
        total: number;
        limit: number;
        offset: number;
        has_more: boolean;
    };
};
