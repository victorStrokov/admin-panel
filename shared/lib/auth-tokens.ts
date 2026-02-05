import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '@/prisma/prisma-client';
import type { NextRequest } from 'next/server';

const ACCESS_TOKEN_EXPIRES_IN = '1h'; // 1 час
const REFRESH_TOKEN_EXPIRES_DAYS = 7; // 7 дней

// Тип payload для accessToken
export type AccessTokenPayload = {
  userId: number;
  email: string;
  iat: number;
  exp: number;
};

// Создание accessToken
export function signAccessToken(payload: { userId: number; email: string }) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET не задан');
  }

  return jwt.sign(payload, secret, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
}

// Проверка accessToken
export function verifyAccessToken(token: string): AccessTokenPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET не задан');
  }

  return jwt.verify(token, secret, {
    algorithms: ['HS256'],
  }) as AccessTokenPayload;
}

// Генерация случайного refreshToken (НЕ JWT)
export function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

// Создание новой сессии
export async function createSession(params: {
  userId: number;
  refreshToken: string;
  deviceId: string;
  req?: NextRequest;
}) {
  const { userId, refreshToken, deviceId, req } = params;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);

  let userAgent: string | undefined;
  let ip: string | undefined;

  if (req) {
    userAgent = req.headers.get('user-agent') ?? undefined;

    // Правильный способ получить IP в Next.js
    const forwardedFor = req.headers.get('x-forwarded-for');
    ip = forwardedFor?.split(',')[0]?.trim() || undefined;
  }

  //  ДОБАВЛЯЕМ ОГРАНИЧЕНИЕ КОЛИЧЕСТВА СЕССИЙ
  const sessions = await prisma.session.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });

  if (sessions.length >= 5) {
    // удаляем самую старую сессию
    await prisma.session.delete({
      where: { id: sessions[0].id },
    });
  }

  // создаём новую сессию
  return prisma.session.create({
    data: {
      userId,
      refreshToken,
      userAgent,
      ip,
      deviceId,
      expiresAt,
    },
  });
}

// Поиск сессии по refreshToken
export async function findSessionByRefreshToken(refreshToken: string) {
  return prisma.session.findUnique({
    where: { refreshToken },
    include: { user: true },
  });
}

// Удаление сессии
export async function deleteSessionByRefreshToken(refreshToken: string) {
  return prisma.session.delete({
    where: { refreshToken },
  });
}
