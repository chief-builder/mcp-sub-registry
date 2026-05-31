/* MCP Registry v0.1 package (server.json 2025-12-11) */

import type { Transport } from './Transport';

export type Package = {
    registryType: 'npm' | 'nuget' | 'pypi' | 'oci' | 'mcpb';
    /**
     * Required except for oci / mcpb.
     */
    registryBaseUrl?: string;
    /**
     * Package name or image reference.
     */
    identifier: string;
    version: string;
    /**
     * Required for mcpb packages.
     */
    fileSha256?: string;
    transport: Transport;
    runtimeHint?: string;
    runtimeArguments?: Array<Record<string, any>>;
    packageArguments?: Array<Record<string, any>>;
    environmentVariables?: Array<Record<string, any>>;
};
