/* MCP Registry v0.1 official _meta block */

import type { ServerStatus } from './ServerStatus';

/**
 * Registry-maintained metadata, surfaced under the
 * "io.modelcontextprotocol.registry/official" key in a server's _meta.
 */
export type OfficialMeta = {
    status: ServerStatus;
    statusMessage?: string;
    publishedAt: string;
    updatedAt: string;
    statusChangedAt?: string;
    isLatest: boolean;
};

export const OFFICIAL_META_KEY = 'io.modelcontextprotocol.registry/official';
