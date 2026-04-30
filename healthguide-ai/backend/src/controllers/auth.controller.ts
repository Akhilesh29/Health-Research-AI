import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { env } from '../config/env';
import { AuthenticatedRequest } from '../types';
import { createError } from '../middleware/error.middleware';

const signupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function generateToken(userId: string, email: string): string {
  const tokenOptions: SignOptions = {
    // jsonwebtoken's `expiresIn` type is narrower than `string`, so we cast safely.
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };

  return jwt.sign({ userId, email }, env.JWT_SECRET, tokenOptions);
}

export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
      return;
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      next(createError('Email already in use', 409));
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    const token = generateToken(user.id, user.email);
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
      return;
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      next(createError('Invalid email or password', 401));
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      next(createError('Invalid email or password', 401));
      return;
    }

    const token = generateToken(user.id, user.email);
    res.json({
      user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
      token,
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    if (!user) {
      next(createError('User not found', 404));
      return;
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
}
