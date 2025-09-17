import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// Server validation schema
export const serverPublishSchema = Joi.object({
  name: Joi.string()
    .pattern(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/)
    .required()
    .messages({
      'string.pattern.base': 'Server name must follow reverse DNS format (e.g., com.company.server-name)',
    }),
  description: Joi.string().min(10).max(500).required(),
  version: Joi.string()
    .pattern(/^\d+\.\d+\.\d+(-[\w\d\-_]+)?(\+[\w\d\-_]+)?$/)
    .required()
    .messages({
      'string.pattern.base': 'Version must be valid semantic version (e.g., 1.0.0)',
    }),
  status: Joi.string().valid('experimental', 'beta', 'stable', 'deprecated').default('experimental'),
  repository: Joi.object({
    type: Joi.string().valid('git', 'svn', 'hg').required(),
    url: Joi.string().uri().required(),
  }).optional(),
  packages: Joi.array().items(
    Joi.object({
      registry: Joi.string().valid('npm', 'pypi', 'maven', 'docker').required(),
      identifier: Joi.string().required(),
      version: Joi.string().optional(),
    })
  ).optional(),
  remote: Joi.object({
    transport: Joi.string().valid('stdio', 'http', 'https', 'ws', 'wss').required(),
    url: Joi.string().when('transport', {
      is: Joi.string().valid('http', 'https', 'ws', 'wss'),
      then: Joi.string().uri().required(),
      otherwise: Joi.string().optional(),
    }),
  }).optional(),
  metadata: Joi.object().pattern(
    /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/,
    Joi.any()
  ).optional(),
});

// API Key validation schema
export const apiKeyCreateSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).optional(),
  scopes: Joi.array().items(
    Joi.string().valid('read', 'write', 'publish', 'admin')
  ).default(['read']),
  expires_in_days: Joi.number().integer().min(1).max(365).optional(),
});

// User validation schemas
export const userRegisterSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(8).max(128).required()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    }),
});

export const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Validation middleware factory
export function validateBody(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details
      });
    }

    req.body = value;
    next();
  };
}

// Query parameter validation schemas
export const paginationQuerySchema = Joi.object({
  limit: Joi.string().pattern(/^\d+$/).default('50'),
  offset: Joi.string().pattern(/^\d+$/).default('0'),
}).unknown(true); // Allow other query params

export function validateQuery(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query, { 
      abortEarly: false,
      stripUnknown: true 
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Query validation failed',
        code: 'QUERY_VALIDATION_ERROR',
        details
      });
    }

    req.query = value;
    next();
  };
}