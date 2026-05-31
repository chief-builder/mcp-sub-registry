import { Router, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../db';
import { logger } from '../utils/logger';
import { config } from '../config';
import { authRateLimit } from '../middleware/security';
import {
  UserRegisterRequest,
  UserLoginRequest,
  UserResponseResult,
  LoginResponseResult,
  TypedRequest
} from '../types';

const router = Router();

// Constant-time string comparison that is safe against length leaks.
function safeEquals(a: string | undefined, b: string | undefined): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// POST /api/v1/auth/register - Bootstrap the first admin user (restricted endpoint)
router.post('/register', authRateLimit, async (req: TypedRequest<UserRegisterRequest>, res: Response<UserResponseResult>) => {
  try {
    // Bootstrap-only: once any user exists, registration is permanently closed.
    // Subsequent users/services must be provisioned via authenticated admin flows.
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      return res.status(403).json({
        error: 'User registration is disabled. Use API keys for service authentication.',
        code: 'REGISTRATION_DISABLED'
      });
    }

    // When a setup key is configured (always in production), require an exact,
    // constant-time match of the x-admin-key header. Fails closed if either side
    // is empty.
    const adminKey = req.headers['x-admin-key'] as string | undefined;
    if (config.admin.setupKey && !safeEquals(adminKey, config.admin.setupKey)) {
      return res.status(403).json({
        error: 'User registration is disabled. Use API keys for service authentication.',
        code: 'REGISTRATION_DISABLED'
      });
    }

    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields: email, username, password',
        code: 'VALIDATION_ERROR'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters long',
        code: 'VALIDATION_ERROR'
      });
    }

    const password_hash = await bcrypt.hash(password, config.security.bcryptRounds);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password_hash,
        roles: ['admin'] // New users are admins for setup purposes
      },
      select: {
        id: true,
        email: true,
        username: true,
        roles: true,
        is_active: true,
        created_at: true
      }
    });

    res.status(201).json(user);
  } catch (error) {
    logger.error('Error registering user:', error);
    if ((error as any).code === 'P2002') {
      return res.status(400).json({ error: 'Email or username already exists', code: 'USER_EXISTS' });
    }
    res.status(500).json({ error: 'Failed to register user', code: 'INTERNAL_ERROR' });
  }
});

// POST /api/v1/auth/login - Admin user login
router.post('/login', authRateLimit, async (req: TypedRequest<UserLoginRequest>, res: Response<LoginResponseResult>) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required', code: 'VALIDATION_ERROR' });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.is_active || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login: new Date() }
    });

    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        roles: user.roles
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        roles: user.roles,
        is_active: user.is_active,
        created_at: user.created_at
      },
      message: 'For service-to-service authentication, use API keys instead of JWT tokens'
    });
  } catch (error) {
    logger.error('Error logging in user:', error);
    res.status(500).json({ error: 'Failed to login', code: 'INTERNAL_ERROR' });
  }
});

// GET /api/v1/auth/me - Get current user
router.get('/me', async (req: TypedRequest, res: Response<UserResponseResult>) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided', code: 'NO_TOKEN' });
    }

    const decoded = jwt.verify(token, config.jwt.secret, { algorithms: ['HS256'] }) as jwt.JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        roles: true,
        is_active: true,
        created_at: true
      }
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid token', code: 'INVALID_TOKEN' });
    }

    res.json(user);
  } catch (error) {
    logger.error('Error getting user:', error);
    res.status(401).json({ error: 'Invalid token', code: 'INVALID_TOKEN' });
  }
});

export default router;