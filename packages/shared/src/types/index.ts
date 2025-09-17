// MCP Registry API Types
// Based on MCP Registry API v2025-07-09

export interface MCPServer {
  id: string;
  name: string;
  description: string;
  version: string;
  status: ServerStatus;
  created_at: string;
  updated_at: string;
  repository?: Repository;
  packages?: Package[];
  remote?: RemoteConfig;
  metadata?: Record<string, any>;
}

export type ServerStatus = 'experimental' | 'beta' | 'stable' | 'deprecated';

export interface Repository {
  type: 'git' | 'mercurial' | 'svn';
  url: string;
  branch?: string;
  tag?: string;
  commit?: string;
}

export interface Package {
  registry: 'npm' | 'pypi' | 'maven' | 'docker' | 'cargo' | 'gem';
  identifier: string;
  version: string;
  url?: string;
}

export interface RemoteConfig {
  transport: 'stdio' | 'http' | 'https' | 'tcp' | 'websocket';
  url?: string;
  host?: string;
  port?: number;
  path?: string;
}

// API Response Types
export interface ServerListResponse {
  servers: MCPServer[];
  pagination: PaginationInfo;
}

export interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
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

// Request Types
export interface PublishServerRequest {
  name: string;
  description: string;
  version: string;
  status: ServerStatus;
  repository?: Repository;
  packages?: Package[];
  remote?: RemoteConfig;
  metadata?: Record<string, any>;
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
  status?: ServerStatus;
  search?: string;
  metadata?: Record<string, any>;
  limit?: number;
  offset?: number;
}

export interface ApiKeyFilters {
  active?: boolean;
  scope?: ApiKeyScope;
  limit?: number;
  offset?: number;
}