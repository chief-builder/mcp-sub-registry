import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// --- server.json (2025-12-11) building blocks ---

// Reverse-DNS namespace, a slash, then the server name (e.g. io.github.user/server-name).
const serverNameSchema = Joi.string()
  .pattern(/^[a-zA-Z0-9.-]+\/[a-zA-Z0-9._-]+$/)
  .max(200)
  .required()
  .messages({
    'string.pattern.base':
      'Server name must be "<reverse-dns-namespace>/<name>" (e.g., io.github.user/server-name)',
  });

const versionSchema = Joi.string()
  .pattern(/^\d+\.\d+\.\d+(-[\w\d\-.]+)?(\+[\w\d\-.]+)?$/)
  .max(255)
  .required()
  .messages({
    'string.pattern.base': 'Version must be a valid semantic version (e.g., 1.0.0)',
  });

// Only web schemes are permitted anywhere a URL is later rendered as an href.
const httpUrl = Joi.string().uri({ scheme: ['http', 'https'] });

const transportSchema = Joi.object({
  type: Joi.string().valid('stdio', 'streamable-http', 'sse').required(),
  url: httpUrl.when('type', {
    is: Joi.valid('streamable-http', 'sse'),
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});

const argumentSchema = Joi.object({
  type: Joi.string().valid('positional', 'named').required(),
  name: Joi.string().optional(),
  value: Joi.string().optional(),
  valueHint: Joi.string().optional(),
  description: Joi.string().optional(),
  default: Joi.string().optional(),
  isRequired: Joi.boolean().optional(),
  isRepeated: Joi.boolean().optional(),
  format: Joi.string().valid('string', 'number', 'boolean', 'filepath').optional(),
  choices: Joi.array().items(Joi.string()).optional(),
});

const environmentVariableSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
  default: Joi.string().optional(),
  isRequired: Joi.boolean().optional(),
  isSecret: Joi.boolean().optional(),
  choices: Joi.array().items(Joi.string()).optional(),
});

const keyValueInputSchema = Joi.object({
  name: Joi.string().required(),
  value: Joi.string().optional(),
  description: Joi.string().optional(),
  isRequired: Joi.boolean().optional(),
  isSecret: Joi.boolean().optional(),
});

const packageSchema = Joi.object({
  registryType: Joi.string().valid('npm', 'nuget', 'pypi', 'oci', 'mcpb').required(),
  // registryBaseUrl is required except for oci / mcpb, which are self-describing.
  registryBaseUrl: httpUrl.when('registryType', {
    is: Joi.valid('oci', 'mcpb'),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  identifier: Joi.string().required(),
  version: Joi.string().required(),
  // mcpb packages must declare a content hash.
  fileSha256: Joi.string().when('registryType', {
    is: 'mcpb',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  transport: transportSchema.required(),
  runtimeHint: Joi.string().optional(),
  runtimeArguments: Joi.array().items(argumentSchema).optional(),
  packageArguments: Joi.array().items(argumentSchema).optional(),
  environmentVariables: Joi.array().items(environmentVariableSchema).optional(),
});

const remoteSchema = Joi.object({
  type: Joi.string().valid('streamable-http', 'sse').required(),
  url: httpUrl.required(),
  headers: Joi.array().items(keyValueInputSchema).optional(),
});

// Full server.json publish payload.
export const serverPublishSchema = Joi.object({
  $schema: Joi.string().uri().optional(),
  name: serverNameSchema,
  description: Joi.string().min(1).max(1000).required(),
  title: Joi.string().max(200).optional(),
  version: versionSchema,
  websiteUrl: httpUrl.optional(),
  repository: Joi.object({
    url: httpUrl.required(),
    source: Joi.string().max(100).required(),
    id: Joi.string().optional(),
    subfolder: Joi.string().optional(),
  }).optional(),
  packages: Joi.array().items(packageSchema).optional(),
  remotes: Joi.array().items(remoteSchema).optional(),
  _meta: Joi.object().optional(),
}).or('packages', 'remotes');

// Status update payload for the PATCH .../status endpoints.
export const statusUpdateSchema = Joi.object({
  status: Joi.string().valid('active', 'deprecated', 'deleted').required(),
  statusMessage: Joi.string().max(500).optional(),
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

// v0.1 cursor-based server listing query.
export const serverListQuerySchema = Joi.object({
  cursor: Joi.string().base64({ urlSafe: true, paddingRequired: false }).optional(),
  limit: Joi.string().pattern(/^\d+$/).default('50'),
  search: Joi.string().min(1).max(200).optional(),
  updated_since: Joi.string().isoDate().optional(),
  version: Joi.string().max(255).optional(),
  include_deleted: Joi.string().valid('true', 'false').default('false'),
});

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