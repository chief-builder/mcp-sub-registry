import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    roles: string[];
    auth_method: 'jwt' | 'api_key';
  };
  api_key?: {
    id: string;
    name: string;
    scopes: string[];
    user_id: string;
  };
}

export interface JWTPayload {
  userId: string;
  email: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

export interface ApiKeyValidationResult {
  valid: boolean;
  api_key?: {
    id: string;
    name: string;
    scopes: string[];
    user_id: string;
    user: {
      id: string;
      email: string;
      roles: string[];
    };
  };
  error?: string;
}

export interface AuthenticationOptions {
  required?: boolean;
  scopes?: string[];
  allowApiKey?: boolean;
  allowJWT?: boolean;
}

export type AuthScope = 'read' | 'write' | 'publish' | 'admin';