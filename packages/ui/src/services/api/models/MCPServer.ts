/* MCP Registry v0.1 server (server.json 2025-12-11 + official _meta) */

import type { OfficialMeta } from './OfficialMeta';
import type { Package } from './Package';
import type { RemoteConfig } from './RemoteConfig';
import type { Repository } from './Repository';

export type MCPServer = {
    $schema?: string;
    /**
     * Server name as "<reverse-dns-namespace>/<name>".
     */
    name: string;
    description: string;
    /**
     * Human-readable display name.
     */
    title?: string;
    version: string;
    websiteUrl?: string;
    repository?: Repository;
    packages?: Array<Package>;
    remotes?: Array<RemoteConfig>;
    _meta?: {
        'io.modelcontextprotocol.registry/official'?: OfficialMeta;
        [key: string]: any;
    };
};
