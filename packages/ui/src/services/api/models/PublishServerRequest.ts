/* MCP Registry v0.1 publish payload (a server.json document) */

import type { Package } from './Package';
import type { RemoteConfig } from './RemoteConfig';
import type { Repository } from './Repository';

export type PublishServerRequest = {
    $schema?: string;
    /**
     * Server name as "<reverse-dns-namespace>/<name>".
     */
    name: string;
    description: string;
    title?: string;
    version: string;
    websiteUrl?: string;
    repository?: Repository;
    packages?: Array<Package>;
    remotes?: Array<RemoteConfig>;
    _meta?: Record<string, any>;
};
