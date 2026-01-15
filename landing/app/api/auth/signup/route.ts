import { NextRequest, NextResponse } from 'next/server';
import {
  hashPassword,
  createUser,
  getUserByEmail,
  generateToken,
  setAuthCookie,
  formatUserResponse,
} from '@/lib/auth';

function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const existingUser = getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const simpleId = generateUserId();
    const user = createUser(simpleId, email, name, passwordHash);

    const token = generateToken(user.id, user.email);
    const response = NextResponse.json(formatUserResponse(user), { status: 201 });
    setAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
