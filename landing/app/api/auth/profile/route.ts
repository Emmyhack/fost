import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, updateUser, formatUserResponse } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);

    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const updates = await request.json();

    // Don't allow updating certain fields
    delete updates.id;
    delete updates.createdAt;
    delete updates.passwordHash;
    delete updates.plan; // Plans should be updated via payment system

    const updated = updateUser(auth.user.id, updates);
    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }

    return NextResponse.json(formatUserResponse(updated), { status: 200 });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
