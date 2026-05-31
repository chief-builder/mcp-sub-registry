/* MCP Registry v0.1 repository (server.json 2025-12-11) */

export type Repository = {
    url: string;
    /**
     * Source control host, e.g. "github".
     */
    source: string;
    id?: string;
    /**
     * Path within the repository for monorepos.
     */
    subfolder?: string;
};
