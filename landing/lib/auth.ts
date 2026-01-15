import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import {
  loadUsers,
  saveUsers,
  addUser,
  updateUserData,
  getUserById as getPersistentUserById,
  getUserByEmail as getPersistentUserByEmail,
} from './user-storage';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SALT_ROUNDS = 10;

// In-memory cache for current session - load on startup
let usersCache: Map<string, any> = loadUsers();

function getUsersCache(): Map<string, any> {
  // Ensure cache is initialized
  if (!usersCache || usersCache.size === 0) {
    usersCache = loadUsers();
  }
  return usersCache;
}

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
  createdAt: string; // ISO string
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
    createdAt: new Date().toISOString(),
  };
  
  const users = getUsersCache();
  users.set(id, user);
  addUser(user); // Persist to disk
  
  return user;
}

export function getUserById(userId: string): StoredUser | undefined {
  // Try cache first, then fallback to persistent storage
  const users = getUsersCache();
  let user = users.get(userId);
  
  if (!user) {
    user = getPersistentUserById(userId);
    if (user) {
      users.set(userId, user); // Cache it
    }
  }
  
  return user;
}

export function getUserByEmail(email: string): StoredUser | undefined {
  // Try cache first
  const users = getUsersCache();
  for (const user of users.values()) {
    if (user.email === email) {
      return user;
    }
  }
  
  // Fallback to persistent storage
  const persistentUser = getPersistentUserByEmail(email);
  if (persistentUser) {
    users.set(persistentUser.id, persistentUser); // Cache it
  }
  
  return persistentUser;
}

export function updateUser(userId: string, updates: Partial<StoredUser>): StoredUser | null {
  const users = getUsersCache();
  const user = users.get(userId);
  if (!user) return null;

  const updated = { ...user, ...updates };
  users.set(userId, updated);
  updateUserData(userId, updates); // Persist to disk
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
