/* MCP Registry v0.1 list metadata (cursor pagination) */

export type PaginationInfo = {
    /**
     * Total number of matching servers.
     */
    count: number;
    /**
     * Opaque cursor for the next page; absent when there are no more results.
     */
    nextCursor?: string;
};
