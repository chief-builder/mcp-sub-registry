/* MCP Registry v0.1 remote (server.json 2025-12-11) */

export type RemoteConfig = {
    type: 'streamable-http' | 'sse';
    url: string;
    headers?: Array<{
        name: string;
        value?: string;
        description?: string;
        isRequired?: boolean;
        isSecret?: boolean;
    }>;
};
