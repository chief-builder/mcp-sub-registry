/**
 * Centralized configuration management with validation
 */

interface Config {
  port: number;
  nodeEnv: string;
  database: {
    url: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  admin: {
    setupKey?: string;
  };
  logging: {
    level: string;
  };
  security: {
    bcryptRounds: number;
    maxApiKeys: number;
  };
}

// Known placeholder/example values that must never be accepted as real secrets.
const PLACEHOLDER_SECRETS = [
  'your-secure-jwt-secret-here',
  'your-secure-jwt-secret-here-minimum-32-characters',
  'your-admin-setup-key-for-production',
  'development-admin-key-change-in-production',
  'changeme',
];

const VALID_NODE_ENVS = ['development', 'test', 'production'];

function validateEnv(): Config {
  const required = {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
  };

  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate NODE_ENV is a recognized value (default to development only when unset)
  const nodeEnv = process.env.NODE_ENV || 'development';
  if (!VALID_NODE_ENVS.includes(nodeEnv)) {
    throw new Error(`NODE_ENV must be one of: ${VALID_NODE_ENVS.join(', ')} (got "${nodeEnv}")`);
  }

  // Validate JWT_SECRET strength
  if (required.JWT_SECRET!.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long for security');
  }

  // Validate DATABASE_URL format
  if (!required.DATABASE_URL!.startsWith('postgresql://')) {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection string');
  }

  const port = parseInt(process.env.PORT || '3010', 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be a valid port number (1-65535)');
  }

  return {
    port,
    nodeEnv,
    database: {
      url: required.DATABASE_URL!,
    },
    jwt: {
      secret: required.JWT_SECRET!,
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    },
    admin: {
      setupKey: process.env.ADMIN_SETUP_KEY || undefined,
    },
    logging: {
      level: process.env.LOG_LEVEL || 'info',
    },
    security: {
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
      maxApiKeys: parseInt(process.env.MAX_API_KEYS_PER_USER || '10', 10),
    },
  };
}

export const config = validateEnv();

// Type-safe environment helpers
export const isDevelopment = config.nodeEnv === 'development';
export const isProduction = config.nodeEnv === 'production';
export const isTest = config.nodeEnv === 'test';

// Runtime configuration validation
if (isProduction) {
  if (PLACEHOLDER_SECRETS.includes(config.jwt.secret)) {
    throw new Error('Production JWT_SECRET must be changed from its example/placeholder value');
  }

  // ADMIN_SETUP_KEY is required in production: the admin-bootstrap registration
  // flow depends on it, and a missing/weak key would otherwise fail open.
  if (!config.admin.setupKey) {
    throw new Error('ADMIN_SETUP_KEY is required in production');
  }
  if (config.admin.setupKey.length < 32) {
    throw new Error('ADMIN_SETUP_KEY must be at least 32 characters long in production');
  }
  if (PLACEHOLDER_SECRETS.includes(config.admin.setupKey)) {
    throw new Error('Production ADMIN_SETUP_KEY must be changed from its example/placeholder value');
  }

  if (config.database.url.includes('localhost')) {
    console.warn('⚠️  WARNING: Using localhost database URL in production');
  }
}