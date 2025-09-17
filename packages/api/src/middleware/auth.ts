import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../db';
import { logger } from '../utils/logger';
import { config } from '../config';
import { 
  AuthenticatedRequest, 
  JWTPayload, 
  ApiKeyValidationResult, 
  AuthenticationOptions 
} from '../types/auth';

async function validateApiKey(keyValue: string): Promise<ApiKeyValidationResult> {
  try {
    const keyHash = crypto.createHash('sha256').update(keyValue).digest('hex');
    
    const apiKey = await prisma.apiKey.findUnique({
      where: { key_hash: keyHash },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            roles: true,
            is_active: true
          }
        }
      }
    });

    if (!apiKey || !apiKey.is_active) {
      return { valid: false, error: 'Invalid or inactive API key' };
    }

    if (apiKey.expires_at && new Date() > apiKey.expires_at) {
      return { valid: false, error: 'API key has expired' };
    }

    if (!apiKey.user.is_active) {
      return { valid: false, error: 'Associated user is inactive' };
    }

    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { last_used: new Date() }
    });

    return {
      valid: true,
      api_key: {
        id: apiKey.id,
        name: apiKey.name,
        scopes: apiKey.scopes,
        user_id: apiKey.user_id,
        user: apiKey.user
      }
    };
  } catch (error) {
    logger.error('API key validation error:', error);
    return { valid: false, error: 'API key validation failed' };
  }
}

function validateJWT(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as jwt.JwtPayload;
    if (decoded && decoded.userId && decoded.email && decoded.roles) {
      return {
        userId: decoded.userId,
        email: decoded.email,
        roles: decoded.roles,
        iat: decoded.iat || 0,
        exp: decoded.exp || 0
      };
    }
    return null;
  } catch (error) {
    logger.debug('JWT validation failed:', error);
    return null;
  }
}

function hasRequiredScope(userScopes: string[], requiredScopes: string[]): boolean {
  if (requiredScopes.length === 0) return true;
  return requiredScopes.some(scope => userScopes.includes(scope) || userScopes.includes('admin'));
}

export function authenticate(options: AuthenticationOptions = {}) {
  const {
    required = true,
    scopes = [],
    allowApiKey = true,
    allowJWT = true
  } = options;

  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization as string | undefined;
      
      if (!authHeader) {
        if (!required) {
          return next();
        }
        return res.status(401).json({
          error: 'Authorization header required',
          code: 'UNAUTHORIZED'
        });
      }

      if (authHeader.startsWith('Bearer ') && allowJWT) {
        const token = authHeader.replace('Bearer ', '');
        const jwtPayload = validateJWT(token);
        
        if (jwtPayload) {
          if (scopes.length > 0 && !hasRequiredScope(jwtPayload.roles, scopes)) {
            return res.status(403).json({
              error: 'Insufficient permissions',
              code: 'FORBIDDEN'
            });
          }

          req.user = {
            id: jwtPayload.userId,
            email: jwtPayload.email,
            roles: jwtPayload.roles,
            auth_method: 'jwt'
          };
          
          return next();
        }
      }

      if (authHeader.startsWith('ApiKey ') && allowApiKey) {
        const apiKeyValue = authHeader.replace('ApiKey ', '');
        const validation = await validateApiKey(apiKeyValue);
        
        if (validation.valid && validation.api_key) {
          if (scopes.length > 0 && !hasRequiredScope(validation.api_key.scopes, scopes)) {
            return res.status(403).json({
              error: 'API key lacks required permissions',
              code: 'FORBIDDEN'
            });
          }

          req.user = {
            id: validation.api_key.user.id,
            email: validation.api_key.user.email,
            roles: validation.api_key.user.roles,
            auth_method: 'api_key'
          };
          
          req.api_key = validation.api_key;
          
          return next();
        }
      }

      if (!required) {
        return next();
      }

      return res.status(401).json({
        error: 'Invalid authentication credentials',
        code: 'UNAUTHORIZED'
      });

    } catch (error) {
      logger.error('Authentication middleware error:', error);
      return res.status(500).json({
        error: 'Authentication failed',
        code: 'INTERNAL_ERROR'
      });
    }
  };
}

export function requireAuth(scopes: string[] = []) {
  return authenticate({ required: true, scopes });
}

export function optionalAuth(scopes: string[] = []) {
  return authenticate({ required: false, scopes });
}