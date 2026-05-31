// MCP Registry API Types
// Aligned with the official MCP Registry API v0.1 and server.json 2025-12-11.

export const SERVER_JSON_SCHEMA_URL =
  'https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json';
export const OFFICIAL_META_KEY = 'io.modelcontextprotocol.registry/official';

export type ServerStatus = 'active' | 'deprecated' | 'deleted';
export type PackageRegistryType = 'npm' | 'nuget' | 'pypi' | 'oci' | 'mcpb';
export type PackageTransportType = 'stdio' | 'streamable-http' | 'sse';
export type RemoteTransportType = 'streamable-http' | 'sse';

export interface Repository {
  url: string;
  source: string;
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

export interface RemoteConfig {
  type: RemoteTransportType;
  url: string;
  headers?: Array<{ name: string; value?: string; description?: string; isRequired?: boolean; isSecret?: boolean }>;
}

export interface OfficialMeta {
  status: ServerStatus;
  statusMessage?: string;
  publishedAt: string;
  updatedAt: string;
  statusChangedAt?: string;
  isLatest: boolean;
}

export interface MCPServer {
  $schema?: string;
  name: string;
  description: string;
  title?: string;
  version: string;
  websiteUrl?: string;
  repository?: Repository;
  packages?: Package[];
  remotes?: RemoteConfig[];
  _meta?: Record<string, any> & { [OFFICIAL_META_KEY]?: OfficialMeta };
}

// API Response Types
export interface ServerListResponse {
  servers: MCPServer[];
  metadata: PaginationInfo;
}

export interface PaginationInfo {
  count: number;
  nextCursor?: string;
}

// Authentication Types
export interface User {
  id: string;
  email: string;
  username: string;
  roles: UserRole[];
  is_active: boolean;
  created_at: string;
}

export type UserRole = 'admin' | 'publisher' | 'reader';

export interface ApiKey {
  id: string;
  name: string;
  description?: string;
  key?: string; // Only returned when creating
  scopes: ApiKeyScope[];
  expires_at: string;
  created_at: string;
  updated_at: string;
  last_used?: string;
  is_active: boolean;
  user: Pick<User, 'id' | 'email' | 'username'>;
}

export type ApiKeyScope = 'read' | 'publish' | 'admin';

// Request Types - a publish payload is a server.json document.
export interface PublishServerRequest {
  $schema?: string;
  name: string;
  description: string;
  title?: string;
  version: string;
  websiteUrl?: string;
  repository?: Repository;
  packages?: Package[];
  remotes?: RemoteConfig[];
  _meta?: Record<string, any>;
}

export interface CreateApiKeyRequest {
  name: string;
  description?: string;
  scopes: ApiKeyScope[];
  expires_in_days?: number;
}

export interface UpdateApiKeyRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
}

// Error Types
export interface APIError {
  error: string;
  code: string;
  details?: any;
  timestamp?: string;
}

// Health Check Types
export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  version?: string;
  uptime?: number;
}

export interface MCPHealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
}

// Metrics Types
export interface RegistryMetrics {
  servers: {
    total: number;
    by_status: Record<ServerStatus, number>;
  };
  users: {
    total: number;
    active: number;
  };
  api_keys: {
    total: number;
    active: number;
  };
  requests: {
    total: number;
    rate_per_hour: number;
  };
}

// Filter and Query Types
export interface ServerFilters {
  search?: string;
  version?: string;
  updated_since?: string;
  include_deleted?: boolean;
  limit?: number;
  cursor?: string;
}

export interface ApiKeyFilters {
  active?: boolean;
  scope?: ApiKeyScope;
  limit?: number;
  offset?: number;
}