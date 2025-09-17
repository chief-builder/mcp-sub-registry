/**
 * TypeScript type definitions for MCP Registry API
 * Based on the official MCP Registry API specification v2025-07-09
 */

// Core MCP Server schema types
export interface MCPRepository {
  type: string;
  url: string;
}

export interface MCPPackage {
  registry: string;
  identifier: string;
  version?: string;
}

export interface MCPRemote {
  transport: string;
  url: string;
  headers?: Record<string, string>;
}

export type MCPServerStatus = 'experimental' | 'beta' | 'stable' | 'deprecated';

export interface MCPServer {
  id?: string; // Only present in responses
  name: string;
  description: string;
  version: string;
  status?: MCPServerStatus;
  repository?: MCPRepository;
  packages?: MCPPackage[];
  remote?: MCPRemote;
  metadata?: Record<string, any>;
}

// API request/response types
export interface PublishServerRequest {
  name: string;
  description: string;
  version: string;
  status?: MCPServerStatus;
  repository?: MCPRepository;
  packages?: MCPPackage[];
  remote?: MCPRemote;
  metadata?: Record<string, any>;
}

export interface ListServersResponse {
  servers: MCPServer[];
  metadata: {
    count: number;
    next_cursor?: string;
  };
}

export interface ListServersQuery {
  search?: string;
  updated_since?: string;
  status?: MCPServerStatus;
  cursor?: string;
  limit?: string;
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
}

export interface ErrorResponse {
  error: string;
  code?: string;
}

// Enterprise metadata types (using reverse DNS namespacing)
export interface EnterpriseMetadata {
  'com.company.enterprise'?: {
    owner?: string;
    tier?: number;
    security_classification?: string;
    cost_center?: string;
    compliance_tags?: string[];
  };
  'com.company.monitoring'?: {
    alerts_enabled?: boolean;
    dashboard_url?: string;
  };
  [key: string]: any; // Allow additional namespaced metadata
}

// Internal database types (includes additional fields)
export interface DBServer extends MCPServer {
  id: string;
  created_at: Date;
  updated_at: Date;
}