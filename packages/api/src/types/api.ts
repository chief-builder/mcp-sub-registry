import { Request } from 'express';
import { ParsedQs } from 'qs';
import {
  ServerDetail,
  ServerResponse,
  ServerListResponse,
  ServerRegistryStatus,
} from './mcp';

// A publish request body is a full server.json document (ServerDetail).
export type ServerPublishRequest = ServerDetail;

// Status update request for the PATCH .../status endpoints.
export interface StatusUpdateRequest {
  status: ServerRegistryStatus;
  statusMessage?: string;
}

// Response for the all-versions status update endpoint.
export interface AllVersionsStatusResponse {
  updatedCount: number;
  servers: ServerResponse[];
}

// Re-export the response shapes consumed by routes.
export type { ServerResponse, ServerListResponse } from './mcp';

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

// v0.1 server listing uses opaque cursor pagination plus spec filters.
export interface ServersQuery {
  cursor?: string;
  limit?: string;
  search?: string;
  updated_since?: string;
  version?: string;
  include_deleted?: string;
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
export type ServersListResponseResult = ServerListResponse | APIErrorResponse;
export type UserResponseResult = UserResponse | APIErrorResponse;
export type LoginResponseResult = LoginResponse | APIErrorResponse;
export type AllVersionsStatusResponseResult = AllVersionsStatusResponse | APIErrorResponse;

// Helper type guard functions
export function isErrorResponse(response: any): response is APIErrorResponse {
  return response && typeof response.error === 'string' && typeof response.code === 'string';
}

export function isSuccessResponse<T>(response: T | APIErrorResponse): response is T {
  return !isErrorResponse(response);
}