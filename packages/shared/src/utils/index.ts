// Shared Utility Functions

import { z } from 'zod';
import { SERVER_STATUSES, API_KEY_SCOPES, USER_ROLES } from '../constants';
import type { ServerStatus, ApiKeyScope, UserRole } from '../types';

// Validation Schemas using Zod
export const ServerStatusSchema = z.enum(SERVER_STATUSES);
export const ApiKeyScopeSchema = z.enum(API_KEY_SCOPES);
export const UserRoleSchema = z.enum(USER_ROLES);

// Server validation schema
export const ServerSchema = z.object({
  name: z.string().min(3).max(100).regex(/^[a-z0-9][a-z0-9\-\.]*[a-z0-9]$/),
  description: z.string().min(1).max(500),
  version: z.string().regex(/^\d+\.\d+\.\d+(-[a-zA-Z0-9]+)?(\+[a-zA-Z0-9]+)?$/),
  status: ServerStatusSchema,
  repository: z.object({
    type: z.enum(['git', 'mercurial', 'svn']),
    url: z.string().url(),
    branch: z.string().optional(),
    tag: z.string().optional(),
    commit: z.string().optional()
  }).optional(),
  packages: z.array(z.object({
    registry: z.enum(['npm', 'pypi', 'maven', 'docker', 'cargo', 'gem']),
    identifier: z.string().min(1),
    version: z.string().min(1),
    url: z.string().url().optional()
  })).optional(),
  remote: z.object({
    transport: z.enum(['stdio', 'http', 'https', 'tcp', 'websocket']),
    url: z.string().optional(),
    host: z.string().optional(),
    port: z.number().int().positive().optional(),
    path: z.string().optional()
  }).optional(),
  metadata: z.record(z.any()).optional()
});

// API Key validation schema
export const ApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  scopes: z.array(ApiKeyScopeSchema).min(1),
  expires_in_days: z.number().int().positive().max(365).optional()
});

// User validation schema
export const UserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  password: z.string().min(8).max(128)
});

// Utility Functions
export function isValidServerName(name: string): boolean {
  return /^[a-z0-9][a-z0-9\-\.]*[a-z0-9]$/.test(name) && name.length >= 3 && name.length <= 100;
}

export function isValidVersion(version: string): boolean {
  return /^\d+\.\d+\.\d+(-[a-zA-Z0-9]+)?(\+[a-zA-Z0-9]+)?$/.test(version);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function generateApiKeyPrefix(): string {
  return 'mcp_';
}

export function sanitizeServerName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9\-\.]/g, '');
}

export function formatServerStatus(status: ServerStatus): string {
  const statusMap: Record<ServerStatus, string> = {
    experimental: '🧪 Experimental',
    beta: '🔄 Beta',
    stable: '✅ Stable',
    deprecated: '⚠️ Deprecated'
  };
  return statusMap[status] || status;
}

export function formatApiKeyScope(scope: ApiKeyScope): string {
  const scopeMap: Record<ApiKeyScope, string> = {
    read: '👀 Read Only',
    publish: '📝 Publisher',
    admin: '👑 Administrator'
  };
  return scopeMap[scope] || scope;
}

export function formatUserRole(role: UserRole): string {
  const roleMap: Record<UserRole, string> = {
    reader: '👀 Reader',
    publisher: '📝 Publisher',
    admin: '👑 Administrator'
  };
  return roleMap[role] || role;
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength - 3)}...`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const target = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - target.getTime();
  
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  
  if (diffMs < minute) return 'just now';
  if (diffMs < hour) return `${Math.floor(diffMs / minute)} minutes ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)} hours ago`;
  if (diffMs < week) return `${Math.floor(diffMs / day)} days ago`;
  if (diffMs < month) return `${Math.floor(diffMs / week)} weeks ago`;
  return formatDate(target);
}

export function parseJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = parseJWT(token);
  if (!payload || !payload.exp) return true;
  return payload.exp * 1000 < Date.now();
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

export function camelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (_, c) => c.toLowerCase());
}

// Type guards
export function isServerStatus(value: any): value is ServerStatus {
  return SERVER_STATUSES.includes(value);
}

export function isApiKeyScope(value: any): value is ApiKeyScope {
  return API_KEY_SCOPES.includes(value);
}

export function isUserRole(value: any): value is UserRole {
  return USER_ROLES.includes(value);
}

// Error handling utilities
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Authorization failed') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}