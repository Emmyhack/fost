# Paycrest Payment Integration Guide

## Overview

FOST now includes integrated payment processing via Paycrest, enabling users to upgrade their accounts and purchase credits for SDK generation. The platform supports multiple payment settlement methods including **Credit/Debit Cards**, **Mobile Money**, and **Paj Cash**.

## Architecture

### Components

1. **Paycrest Library** (`/lib/paycrest.ts`)
   - Payment session creation
   - Webhook signature verification
   - Payment record storage
   - Credit allocation logic

2. **Payment API Endpoints**
   - `POST /api/payments/create` - Initiate payment session
   - `POST /api/payments/webhook` - Handle Paycrest webhooks

3. **Pricing Modal** (`/app/platform/components/pricing-modal.tsx`)
   - Plan selection UI (Pro, Enterprise)
   - Payment initiation
   - Error handling and loading states

4. **Dashboard Integration**
   - Credits display card
   - "Get More Credits" button
   - Auto-refresh stats after upgrade

## Available Plans

### Pro Plan
- **Price**: $29.99/month
- **Credits**: 1,000
- **Features**: Multi-language SDKs, Web3 integration, Priority support

### Enterprise Plan
- **Price**: $99.99/month
- **Credits**: 5,000
- **Features**: All Pro features + Dedicated support, Custom integrations, Webhook access

## Payment Settlement Methods

FOST supports three payment settlement methods via Paycrest:

### 1. Credit/Debit Card
- **Visa**, **Mastercard**, **American Express**
- Instant processing (2-5 minutes)
- Global availability
- Request: `paymentMethod: "card"`

### 2. Mobile Money
- **Airtel Money**, **MTN Mobile Money**, **Vodafone Cash**, and regional providers
- 5-30 minute processing
- Optimized for Africa and emerging markets
- Request: `paymentMethod: "mobile_money"`

### 3. Paj Cash
- **Fast digital wallet** with instant notifications
- Instant to 10 minute processing
- Multi-currency support
- Low transaction fees
- Cross-border transfer capability
- Request: `paymentMethod: "paj_cash"`

## Payment Flow

```
User clicks "Get More Credits"
    ↓
Pricing Modal opens
    ↓
User selects plan (Pro/Enterprise)
    ↓
User selects payment method (Card/Mobile Money/Paj Cash)
    ↓
POST /api/payments/create with plan and paymentMethod
    ↓
Backend creates Paycrest session with selected method
    ↓
User redirected to Paycrest checkout
    ↓
Payment processed via selected method
    ↓
Paycrest sends webhook to /api/payments/webhook
    ↓
Webhook signature verified
    ↓
Credits allocated to user account
```

## Environment Variables Required

```env
# Paycrest Configuration
PAYCREST_API_KEY=your_api_key_here
PAYCREST_BUSINESS_ID=your_business_id
PAYCREST_WEBHOOK_SECRET=your_webhook_secret
PAYCREST_ENV=sandbox  # or production

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Production: https://your-domain.com
```

## API Reference

### POST /api/payments/create

Create a new payment session.

**Request:**
```json
{
  "plan": "pro",
  "paymentMethod": "paj_cash"
}
```

Supported values:
- `plan`: `"pro"` or `"enterprise"`
- `paymentMethod`: `"card"`, `"mobile_money"`, or `"paj_cash"` (defaults to `"card"`)

**Response:**
```json
{
  "redirectUrl": "https://paycrest.com/checkout/...",
  "sessionId": "session_123abc"
}
```

**Error Response:**
```json
{
  "error": "Invalid payment method"
}
```

### POST /api/payments/webhook

Receive payment notifications from Paycrest.

**Headers:**
```
x-paycrest-signature: hmac_sha256_signature
Content-Type: application/json
```

**Payload:**
```json
{
  "event": "payment.completed",
  "payment": {
    "id": "pay_123",
    "status": "completed",
    "amount": 29.99,
    "currency": "USD",
    "reference": "user_456_pro",
    "metadata": {
      "userId": "user_456",
      "plan": "pro"
    }
  }
}
```

## Payment Status Handling

The webhook handler processes the following payment statuses:

- **`payment.completed`**: Credits allocated to user, payment recorded
- **`payment.failed`**: Payment logged as failed, no credits added
- **`payment.pending`**: Payment recorded as pending, awaiting confirmation

## Testing

### Sandbox Testing

1. Set `PAYCREST_ENV=sandbox` in environment
2. Use Paycrest sandbox dashboard to create test payments
3. Webhooks will be sent to your configured webhook URL

### Local Webhook Testing

For local development, use a tool like `ngrok` to expose your local server:

```bash
ngrok http 3000
```

Then update your Paycrest webhook URL to `https://your-ngrok-url.ngrok.io/api/payments/webhook`

### Test Payment Flow

1. Navigate to dashboard
2. Click "Get More Credits" button
3. Select Pro or Enterprise plan
4. Complete payment in Paycrest checkout
5. Verify credits appear in dashboard

## Database Schema

### Payments Collection

```typescript
interface Payment {
  id: string;           // Unique payment ID
  userId: string;       // User who made payment
  plan: 'pro' | 'enterprise';
  amount: number;       // USD amount
  credits: number;      // Credits to allocate
  status: 'completed' | 'failed' | 'pending';
  paycrestId: string;   // Paycrest payment ID
  timestamp: number;    // Unix timestamp
}
```

## User Credit System

Credits are stored in the user profile:

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  credits: number;      // Current available credits
  // ... other fields
}
```

Credits are:
- Added to user account upon successful payment
- Decremented when SDKs are generated (1 credit per SDK)
- Displayed in dashboard as "Available Credits"

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid plan selected" | Plan not recognized | Ensure plan is 'pro' or 'enterprise' |
| "Unauthorized" | Missing auth token | Login before attempting payment |
| "Invalid signature" | Webhook signature mismatch | Verify PAYCREST_WEBHOOK_SECRET |
| "User not found" | Invalid userId in metadata | Check user ID in payment record |

## Security Considerations

1. **Webhook Signature Verification**: All webhooks are verified using HMAC SHA256
2. **Authentication Required**: Payment endpoints require valid JWT token
3. **Environment Variables**: Sensitive keys stored in environment, never committed
4. **HTTPS Only**: Payments use HTTPS in production
5. **Credit Idempotency**: Multiple webhook calls won't duplicate credits

## Monitoring & Logs

Payment operations are logged to console with following events:

- `Payment session created`: New payment initiated
- `Webhook received`: Payment webhook received
- `Signature verified`: Webhook signature validated
- `Credits allocated`: User account credited
- `Payment recorded`: Payment stored in database

## Future Enhancements

- [ ] Payment history view in user dashboard
- [ ] Subscription auto-renewal support
- [ ] Multiple payment methods (card, mobile money)
- [ ] Refund/dispute handling
- [ ] Invoice generation
- [ ] Usage-based billing alerts
- [ ] Enterprise custom pricing

## Support

For Paycrest-specific issues, refer to:
- Paycrest Documentation: https://paycrest.com/docs
- Paycrest Sandbox Dashboard: https://sandbox.paycrest.com
- Support Email: support@paycrest.com
