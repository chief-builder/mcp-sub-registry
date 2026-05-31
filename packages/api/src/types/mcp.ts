/**
 * TypeScript type definitions for the MCP Registry server.json schema.
 * Aligned with https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json
 */

export const SERVER_JSON_SCHEMA_URL =
  'https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json';

export const OFFICIAL_META_KEY = 'io.modelcontextprotocol.registry/official';

export type ServerRegistryStatus = 'active' | 'deprecated' | 'deleted';
export type PackageRegistryType = 'npm' | 'nuget' | 'pypi' | 'oci' | 'mcpb';
export type PackageTransportType = 'stdio' | 'streamable-http' | 'sse';
export type RemoteTransportType = 'streamable-http' | 'sse';

export interface Repository {
  url: string;
  source: string; // e.g. "github"
  id?: string;
  subfolder?: string;
}

export interface Transport {
  type: PackageTransportType;
  url?: string;
}

export interface Argument {
  type: 'positional' | 'named';
  name?: string;
  value?: string;
  valueHint?: string;
  description?: string;
  default?: string;
  isRequired?: boolean;
  isRepeated?: boolean;
  format?: 'string' | 'number' | 'boolean' | 'filepath';
  choices?: string[];
}

export interface EnvironmentVariable {
  name: string;
  description?: string;
  default?: string;
  isRequired?: boolean;
  isSecret?: boolean;
  choices?: string[];
}

export interface KeyValueInput {
  name: string;
  value?: string;
  description?: string;
  isRequired?: boolean;
  isSecret?: boolean;
}

export interface Package {
  registryType: PackageRegistryType;
  registryBaseUrl?: string;
  identifier: string;
  version: string;
  fileSha256?: string;
  transport: Transport;
  runtimeHint?: string;
  runtimeArguments?: Argument[];
  packageArguments?: Argument[];
  environmentVariables?: EnvironmentVariable[];
}

export interface Remote {
  type: RemoteTransportType;
  url: string;
  headers?: KeyValueInput[];
}

/** A server.json document as submitted by a publisher. */
export interface ServerDetail {
  $schema?: string;
  name: string;
  description: string;
  title?: string;
  version: string;
  websiteUrl?: string;
  repository?: Repository;
  packages?: Package[];
  remotes?: Remote[];
  _meta?: Record<string, any>;
}

/** Registry-maintained status block, exposed under the official _meta key. */
export interface OfficialMeta {
  status: ServerRegistryStatus;
  statusMessage?: string;
  publishedAt: string;
  updatedAt: string;
  statusChangedAt?: string;
  isLatest: boolean;
}

/** A server.json document plus the registry's official _meta block. */
export interface ServerResponse extends ServerDetail {
  _meta: {
    [OFFICIAL_META_KEY]: OfficialMeta;
    [key: string]: any;
  };
}

export interface ServerListResponse {
  servers: ServerResponse[];
  metadata: {
    nextCursor?: string;
    count: number;
  };
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
}
