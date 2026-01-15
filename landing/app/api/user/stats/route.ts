import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';

interface UserStats {
  sdksGenerated: number;
  apiSpecsProcessed: number;
  totalLanguages: number;
  lastGeneratedAt?: Date;
  creditsUsed: number;
}

// In-memory user stats storage (in production, store in database)
const userStats: Map<string, UserStats> = new Map();

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user stats or create default
    let stats = userStats.get(auth.user.id);
    if (!stats) {
      stats = {
        sdksGenerated: 0,
        apiSpecsProcessed: 0,
        totalLanguages: 0,
        creditsUsed: 0,
      };
      userStats.set(auth.user.id, stats);
    }

    return NextResponse.json(
      {
        user: auth.user.email,
        stats,
        plan: auth.user.plan,
        creditsRemaining: auth.user.credits - stats.creditsUsed,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { action, value } = await request.json();

    let stats = userStats.get(auth.user.id);
    if (!stats) {
      stats = {
        sdksGenerated: 0,
        apiSpecsProcessed: 0,
        totalLanguages: 0,
        creditsUsed: 0,
      };
    }

    // Update stats based on action
    switch (action) {
      case 'sdk-generated':
        stats.sdksGenerated += 1;
        stats.creditsUsed += value || 10; // Default 10 credits per SDK
        stats.lastGeneratedAt = new Date();
        break;
      case 'spec-processed':
        stats.apiSpecsProcessed += 1;
        break;
      case 'language-added':
        if (!value) break;
        if (!stats.totalLanguages) stats.totalLanguages = 0;
        const languages = value as string[];
        stats.totalLanguages = Math.max(stats.totalLanguages, languages.length);
        break;
    }

    userStats.set(auth.user.id, stats);

    return NextResponse.json(
      {
        success: true,
        stats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Stats update error:', error);
    return NextResponse.json(
      { error: 'Failed to update user statistics' },
      { status: 500 }
    );
  }
}
