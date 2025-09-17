import { Request } from 'express';
import { ParsedQs } from 'qs';

// Server-related types
export interface ServerPublishRequest {
  name: string;
  description: string;
  version: string;
  status?: 'experimental' | 'beta' | 'stable' | 'deprecated';
  repository?: {
    type: string;
    url: string;
  };
  packages?: Array<{
    registry: string;
    identifier: string;
    version?: string;
  }>;
  remote?: {
    transport: string;
    url?: string;
  };
  metadata?: Record<string, any>;
}

export interface ServerResponse {
  id: string;
  name: string;
  description: string;
  status: string;
  version: string;
  repository?: {
    type: string;
    url: string;
  } | null;
  packages?: Array<{
    registry: string;
    identifier: string;
    version?: string;
  }> | null;
  remote?: {
    transport: string;
    url?: string;
  } | null;
  metadata: Record<string, any>;
  created_at?: Date;
  updated_at?: Date;
}

export interface ServersListResponse {
  servers: ServerResponse[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

// API Key-related types
export interface ApiKeyCreateRequest {
  name: string;
  description?: string;
  scopes?: string[];
  expires_in_days?: number;
}

export interface ApiKeyResponse {
  id: string;
  name: string;
  description: string | null;
  scopes: string[];
  is_active: boolean;
  expires_at: Date | null;
  last_used: Date | null;
  created_at: Date;
  updated_at?: Date;
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

export interface ApiKeyCreateResponse {
  id: string;
  name: string;
  description: string | null;
  scopes: string[];
  is_active: boolean;
  expires_at: Date | null;
  last_used: Date | null;
  created_at: Date;
  updated_at?: Date;
  key: string; // Only returned on creation
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

export interface ApiKeyListResponse {
  api_keys: ApiKeyResponse[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

// User/Auth types
export interface UserRegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  roles: string[];
  is_active: boolean;
  created_at: Date;
}

export interface LoginResponse {
  token: string;
  user: UserResponse;
  message?: string;
}

// Query parameter types
export interface PaginationQuery {
  limit?: string;
  offset?: string;
}

export interface ServersQuery extends PaginationQuery {
  status?: string;
  search?: string;
}

export interface ApiKeysQuery extends PaginationQuery {
  user_id?: string;
}

// Typed request interfaces
export interface TypedRequest<T = any> extends Request {
  body: T;
}

export interface TypedRequestWithQuery<TBody = any, TQuery = ParsedQs> extends Request {
  body: TBody;
  query: TQuery & ParsedQs;
}

// API Error response type (distinct from MCP ErrorResponse)
export interface APIErrorResponse {
  error: string;
  code: string;
  details?: any;
}

// Base response types that can include errors
export type ServerResponseResult = ServerResponse | APIErrorResponse;
export type ApiKeyResponseResult = ApiKeyResponse | APIErrorResponse;
export type ApiKeyCreateResponseResult = ApiKeyCreateResponse | APIErrorResponse;
export type ApiKeyListResponseResult = ApiKeyListResponse | APIErrorResponse;
export type ServersListResponseResult = ServersListResponse | APIErrorResponse;
export type UserResponseResult = UserResponse | APIErrorResponse;
export type LoginResponseResult = LoginResponse | APIErrorResponse;

// Helper type guard functions
export function isErrorResponse(response: any): response is APIErrorResponse {
  return response && typeof response.error === 'string' && typeof response.code === 'string';
}

export function isSuccessResponse<T>(response: T | APIErrorResponse): response is T {
  return !isErrorResponse(response);
}