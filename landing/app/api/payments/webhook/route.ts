import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, handleWebhookPayload, WebhookPayload } from '@/lib/paycrest';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-paycrest-signature') || '';
    const payload = await request.text();

    // Verify webhook signature
    if (!verifyWebhookSignature(payload, signature)) {
      console.warn('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const data: WebhookPayload = JSON.parse(payload);

    // Handle the webhook
    await handleWebhookPayload(data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
