/* MCP Registry v0.1 server list response */

import type { MCPServer } from './MCPServer';
import type { PaginationInfo } from './PaginationInfo';

export type ServerListResponse = {
    servers: Array<MCPServer>;
    metadata: PaginationInfo;
};
