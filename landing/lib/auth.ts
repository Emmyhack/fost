import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SALT_ROUNDS = 10;

// Simple in-memory user database (replace with Prisma/DB in production)
const users: Map<string, any> = new Map();
const tokens: Set<string> = new Set();

export interface TokenPayload {
  userId: string;
  email: string;
  iat: number;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  const cookies = request.cookies.get('auth-token');
  return cookies?.value || null;
}

export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
  });
}

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  plan: 'free' | 'pro' | 'enterprise';
  credits: number;
  createdAt: Date;
  organization?: string;
}

export function createUser(
  id: string,
  email: string,
  name: string,
  passwordHash: string
): StoredUser {
  const user: StoredUser = {
    id,
    email,
    name,
    passwordHash,
    plan: 'free',
    credits: 100, // Free tier starts with 100 credits
    createdAt: new Date(),
  };
  users.set(id, user);
  return user;
}

export function getUserById(userId: string): StoredUser | undefined {
  return users.get(userId);
}

export function getUserByEmail(email: string): StoredUser | undefined {
  for (const user of users.values()) {
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
}

export function updateUser(userId: string, updates: Partial<StoredUser>): StoredUser | null {
  const user = users.get(userId);
  if (!user) return null;

  const updated = { ...user, ...updates };
  users.set(userId, updated);
  return updated;
}

export function formatUserResponse(user: StoredUser) {
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Middleware to check authentication
export async function authenticateRequest(request: NextRequest): Promise<{
  authenticated: boolean;
  user?: StoredUser;
  error?: string;
}> {
  const token = getTokenFromRequest(request);

  if (!token) {
    return {
      authenticated: false,
      error: 'No authentication token provided',
    };
  }

  const payload = verifyToken(token);
  if (!payload) {
    return {
      authenticated: false,
      error: 'Invalid or expired token',
    };
  }

  const user = getUserById(payload.userId);
  if (!user) {
    return {
      authenticated: false,
      error: 'User not found',
    };
  }

  return {
    authenticated: true,
    user,
  };
}
