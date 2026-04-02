import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import { analyzeSymptoms } from '../services/ai.service';
import { findNearbyCare, NearbyCareType } from '../services/nearby-care.service';
import { createError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

const symptomCheckSchema = z.object({
  symptoms: z.array(z.string().min(1)).min(1).max(20),
  age: z.number().int().min(0).max(150).optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  severity: z.enum(['mild', 'moderate', 'severe']).optional(),
  duration: z.string().max(100).optional(),
});

const nearbyCareQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  careType: z.enum(['doctor', 'hospital', 'emergency']).default('doctor'),
  radiusMeters: z.coerce.number().min(1000).max(30000).optional(),
});

export async function createCheck(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = symptomCheckSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
      return;
    }

    const input = parsed.data;
    const analysis = await analyzeSymptoms(input);

    const check = await prisma.symptomCheck.create({
      data: {
        userId: req.userId!,
        symptoms: input.symptoms,
        age: input.age,
        gender: input.gender,
        severity: input.severity,
        duration: input.duration,
        analysis: analysis as object,
        urgencyLevel: analysis.urgencyLevel,
      },
    });

    res.status(201).json({ check: { ...check, analysis } });
  } catch (err) {
    next(err);
  }
}

export async function getChecks(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query['page'] as string) || 1);
    const limit = Math.min(50, parseInt(req.query['limit'] as string) || 10);
    const skip = (page - 1) * limit;

    const [checks, total] = await Promise.all([
      prisma.symptomCheck.findMany({
        where: { userId: req.userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.symptomCheck.count({ where: { userId: req.userId } }),
    ]);

    res.json({
      checks,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

export async function getCheck(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      next(createError('Unauthorized', 401));
      return;
    }

    const idParam = req.params['id'];
    if (!idParam || Array.isArray(idParam)) {
      next(createError('Invalid symptom check id', 400));
      return;
    }

    const check = await prisma.symptomCheck.findFirst({
      where: { id: idParam, userId },
    });

    if (!check) {
      next(createError('Symptom check not found', 404));
      return;
    }

    res.json({ check });
  } catch (err) {
    next(err);
  }
}

export async function deleteCheck(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      next(createError('Unauthorized', 401));
      return;
    }

    const idParam = req.params['id'];
    if (!idParam || Array.isArray(idParam)) {
      next(createError('Invalid symptom check id', 400));
      return;
    }

    const check = await prisma.symptomCheck.findFirst({
      where: { id: idParam, userId },
    });

    if (!check) {
      next(createError('Symptom check not found', 404));
      return;
    }

    await prisma.symptomCheck.delete({ where: { id: idParam } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function getStats(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const [total, urgencyBreakdown] = await Promise.all([
      prisma.symptomCheck.count({ where: { userId: req.userId } }),
      prisma.symptomCheck.groupBy({
        by: ['urgencyLevel'],
        where: { userId: req.userId },
        _count: { urgencyLevel: true },
      }),
    ]);

    const recentChecks = await prisma.symptomCheck.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, symptoms: true, urgencyLevel: true, createdAt: true },
    });

    res.json({
      total,
      urgencyBreakdown: Object.fromEntries(
        urgencyBreakdown.map((u) => [u.urgencyLevel, u._count.urgencyLevel])
      ),
      recentChecks,
    });
  } catch (err) {
    next(err);
  }
}

export async function getNearbyCare(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.userId) {
      next(createError('Unauthorized', 401));
      return;
    }

    const parsed = nearbyCareQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
      return;
    }

    const { lat, lng, careType, radiusMeters } = parsed.data;
    const places = await findNearbyCare(lat, lng, careType as NearbyCareType, radiusMeters);

    res.json({
      careType,
      center: { lat, lng },
      count: places.length,
      places,
    });
  } catch (err) {
    next(err);
  }
}
