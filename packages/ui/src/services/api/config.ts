// API Client Configuration
import { OpenAPI } from './core/OpenAPI';

export interface ApiConfig {
  baseUrl: string;
  token?: string;
  apiKey?: string;
}

export function configureApiClient(config: ApiConfig): void {
  OpenAPI.BASE = config.baseUrl;
  
  if (config.token) {
    OpenAPI.TOKEN = config.token;
  }
  
  if (config.apiKey) {
    OpenAPI.HEADERS = {
      ...OpenAPI.HEADERS,
      'Authorization': `ApiKey ${config.apiKey}`
    };
  }
}

// Default configuration for different environments
export const API_CONFIG = {
  development: {
    baseUrl: 'http://localhost:3010'
  },
  staging: {
    baseUrl: 'https://staging-mcp-registry.company.com'
  },
  production: {
    baseUrl: 'https://mcp-registry.company.com'
  }
} as const;

// Initialize API client with default configuration
export function initializeApiClient(): void {
  const config = getApiConfig();
  configureApiClient(config);
}

// Initialize with persisted token from auth store
export function initializeApiClientWithToken(token: string | null): void {
  const config = getApiConfig();
  configureApiClient(config);
  updateApiToken(token);
}

// Update API client token (for auth state changes)
export function updateApiToken(token: string | null): void {
  if (token) {
    OpenAPI.TOKEN = token;
    // Remove API key header when using JWT
    const headers = { ...OpenAPI.HEADERS };
    delete (headers as any)['Authorization'];
    OpenAPI.HEADERS = headers;
  } else {
    OpenAPI.TOKEN = undefined;
    OpenAPI.HEADERS = {};
  }
}

// Update API client API key (for service authentication)
export function updateApiKey(apiKey: string | null): void {
  if (apiKey) {
    OpenAPI.TOKEN = undefined; // Clear JWT when using API key
    OpenAPI.HEADERS = {
      ...OpenAPI.HEADERS,
      'Authorization': `ApiKey ${apiKey}`
    };
  } else {
    const headers = { ...OpenAPI.HEADERS };
    delete (headers as any)['Authorization'];
    OpenAPI.HEADERS = headers;
  }
}

// Get current environment configuration
export function getApiConfig(): ApiConfig {
  // Use import.meta.env for Vite builds
  const env = ((import.meta as any).env?.MODE || 'development') as keyof typeof API_CONFIG;
  return API_CONFIG[env] || API_CONFIG.development;
}
