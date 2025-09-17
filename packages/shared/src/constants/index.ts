// MCP Registry Constants

export const MCP_VERSION = 'v2025-07-09';
export const API_VERSION = '1.0.0';

// Server Status Constants
export const SERVER_STATUSES = ['experimental', 'beta', 'stable', 'deprecated'] as const;

// User Roles
export const USER_ROLES = ['admin', 'publisher', 'reader'] as const;

// API Key Scopes
export const API_KEY_SCOPES = ['read', 'publish', 'admin'] as const;

// Registry Package Types
export const PACKAGE_REGISTRIES = ['npm', 'pypi', 'maven', 'docker', 'cargo', 'gem'] as const;

// Transport Types
export const TRANSPORT_TYPES = ['stdio', 'http', 'https', 'tcp', 'websocket'] as const;

// Repository Types
export const REPOSITORY_TYPES = ['git', 'mercurial', 'svn'] as const;

// API Endpoints
export const API_ENDPOINTS = {
  // MCP Registry API
  SERVERS: '/v0/servers',
  SERVER_BY_ID: '/v0/servers/:id',
  PUBLISH: '/v0/publish',
  MCP_HEALTH: '/v0/health',
  
  // Authentication
  AUTH_REGISTER: '/api/v1/auth/register',
  AUTH_LOGIN: '/api/v1/auth/login',
  AUTH_ME: '/api/v1/auth/me',
  
  // API Keys
  API_KEYS: '/api/v1/api-keys',
  API_KEY_CREATE: '/api/v1/api-keys/create',
  API_KEY_BY_ID: '/api/v1/api-keys/:id',
  
  // System
  HEALTH: '/health',
  METRICS: '/metrics'
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500
} as const;

// Error Codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
  AUTHORIZATION_FAILED: 'AUTHORIZATION_FAILED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_EXISTS: 'USER_EXISTS',
  SERVER_NOT_FOUND: 'SERVER_NOT_FOUND',
  SERVER_EXISTS: 'SERVER_EXISTS',
  API_KEY_NOT_FOUND: 'API_KEY_NOT_FOUND',
  API_KEY_EXPIRED: 'API_KEY_EXPIRED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  REGISTRATION_DISABLED: 'REGISTRATION_DISABLED',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
} as const;

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 100,
  DEFAULT_OFFSET: 0
} as const;

// Rate Limiting
export const RATE_LIMITS = {
  DEFAULT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000 // limit each IP to 1000 requests per windowMs
  },
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50 // limit each IP to 50 requests per windowMs
  },
  PUBLISH: {
    windowMs: 60 * 1000, // 1 minute
    max: 10 // limit each API key to 10 publishes per minute
  }
} as const;

// Default Expiration Times
export const DEFAULT_EXPIRATION = {
  JWT_TOKEN: '8h',
  API_KEY_DAYS: 90,
  REFRESH_TOKEN: '30d'
} as const;

// Validation Constraints
export const VALIDATION = {
  SERVER_NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
    PATTERN: /^[a-z0-9][a-z0-9\-\.]*[a-z0-9]$/
  },
  SERVER_VERSION: {
    PATTERN: /^\d+\.\d+\.\d+(-[a-zA-Z0-9]+)?(\+[a-zA-Z0-9]+)?$/
  },
  API_KEY_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100
  },
  USER_EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  USER_PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128
  }
} as const;

// Enterprise Metadata Namespaces
export const METADATA_NAMESPACES = {
  ENTERPRISE: 'com.company.enterprise',
  MONITORING: 'com.company.monitoring',
  SECURITY: 'com.company.security',
  COMPLIANCE: 'com.company.compliance'
} as const;