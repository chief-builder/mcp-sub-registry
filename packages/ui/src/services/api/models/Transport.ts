/* MCP Registry v0.1 package transport (server.json 2025-12-11) */

export type Transport = {
    type: 'stdio' | 'streamable-http' | 'sse';
    /**
     * Required for streamable-http / sse transports.
     */
    url?: string;
};
