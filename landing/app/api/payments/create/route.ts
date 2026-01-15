import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { createPaymentSession } from '@/lib/paycrest';

interface CreatePaymentRequest {
  plan: 'pro' | 'enterprise';
  paymentMethod?: 'card' | 'mobile_money' | 'paj_cash';
}

const PLAN_PRICES: Record<string, { amount: number; currency: string; credits: number }> = {
  pro: {
    amount: 2999, // $29.99
    currency: 'USD',
    credits: 1000,
  },
  enterprise: {
    amount: 9999, // $99.99
    currency: 'USD',
    credits: 5000,
  },
};

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);

    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: CreatePaymentRequest = await request.json();
    const { plan, paymentMethod = 'card' } = body;

    if (!plan || !PLAN_PRICES[plan]) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    if (!['card', 'mobile_money', 'paj_cash'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      );
    }

    const planDetails = PLAN_PRICES[plan];

    const paymentSession = await createPaymentSession({
      amount: planDetails.amount,
      currency: planDetails.currency,
      email: auth.user.email,
      userId: auth.user.id,
      plan,
      paymentMethod,
      description: `FOST ${plan.toUpperCase()} Plan - ${planDetails.credits} credits`,
      metadata: {
        planName: plan,
        creditsAmount: planDetails.credits,
        paymentMethod,
      },
    });

    return NextResponse.json(paymentSession);
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment session' },
      { status: 500 }
    );
  }
}
