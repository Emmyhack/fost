# Paycrest Configuration Guide

## Setting Up Paycrest

### 1. Create a Paycrest Account

1. Visit [Paycrest Dashboard](https://dashboard.paycrest.com)
2. Sign up for a business account
3. Complete KYC verification
4. Create your first business profile

### 2. Get Your API Credentials

From the Paycrest dashboard:

1. Go to **Settings → API Keys**
2. Create a new API key:
   - **API Key**: For authentication with Paycrest API
   - **Webhook Secret**: For verifying webhook signatures
3. Copy **Business ID** from your profile settings

### 3. Configure Environment Variables

Create `.env.local` in the landing directory with:

```env
# Paycrest API Configuration
PAYCREST_API_KEY=paycrest_live_xxxxxxxxxxxxxxxxxx
PAYCREST_BUSINESS_ID=biz_xxxxxxxxxxxxxxxxxx
PAYCREST_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxx

# Environment Mode
PAYCREST_ENV=production

# App Configuration (for redirect URLs)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 4. Configure Webhook URL

In Paycrest Dashboard:

1. Go to **Settings → Webhooks**
2. Add webhook endpoint:
   - **URL**: `https://yourdomain.com/api/payments/webhook`
   - **Events**: Select `payment.completed`, `payment.failed`, `payment.pending`
   - **Active**: Toggle enabled

### 5. Set Up Redirect URLs

Paycrest will redirect users back after payment completion. The payment endpoint automatically configures:

- **Success URL**: `{NEXT_PUBLIC_APP_URL}/platform/dashboard`
- **Failure URL**: `{NEXT_PUBLIC_APP_URL}/platform/dashboard`
- **Pending URL**: `{NEXT_PUBLIC_APP_URL}/platform/dashboard`

## Supported Payment Methods

FOST supports three payment settlement methods:

### 1. Credit/Debit Card
- **Supported**: Visa, Mastercard, American Express
- **Processing**: Instant (2-5 minutes)
- **Best for**: International payments
- **Request Parameter**: `card`

### 2. Mobile Money
- **Supported Providers**: 
  - Airtel Money
  - MTN Mobile Money
  - Vodafone Cash
  - Other local mobile money services
- **Processing**: 5-30 minutes
- **Best for**: Africa and emerging markets
- **Request Parameter**: `mobile_money`

### 3. Paj Cash
- **Type**: Digital wallet settlement
- **Processing**: Instant to 10 minutes
- **Benefits**: 
  - Low transaction fees
  - Secure and encrypted
  - Instant notifications
  - Multi-currency support
  - Cross-border transfers
- **Setup**: Enable Paj Cash in Paycrest merchant settings
- **Best for**: Regional transactions and bulk payments
- **Request Parameter**: `paj_cash`

## Using Payment Methods in the Platform

When creating a payment session, specify the payment method:

```typescript
// Request example
const response = await fetch('/api/payments/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    plan: 'pro', // or 'enterprise'
    paymentMethod: 'paj_cash' // 'card', 'mobile_money', or 'paj_cash'
  }),
});
```

### Payment Method Selection UI

Users can select their preferred payment method in the pricing modal:

```
[●] Credit/Debit Card - Visa, Mastercard, etc.
[ ] Mobile Money - Airtel, MTN, Vodafone, etc.
[ ] Paj Cash - Fast, secure digital wallet
```

## Paj Cash Setup Instructions

### Enable Paj Cash in Merchant Settings

1. Log in to Paycrest Dashboard
2. Navigate to **Settings → Payment Methods**
3. Find **Paj Cash** in the available methods
4. Click **Enable** (may require additional verification)
5. Configure Paj Cash-specific settings:
   - Commission rate
   - Settlement frequency
   - Notification preferences

### Paj Cash Transaction Flow

```
User selects "Paj Cash" payment method
    ↓
Clicks "Upgrade Now"
    ↓
Redirected to Paycrest Paj Cash checkout
    ↓
User enters Paj Cash credentials/phone number
    ↓
OTP verification
    ↓
Payment confirmation
    ↓
Redirected back to FOST dashboard
    ↓
Credits allocated to account
```

### Paj Cash Settlement Details

- **Settlement Time**: T+0 to T+1 (same day or next day)
- **Transaction Fees**: 2-3% (configurable in merchant settings)
- **Minimum**: $0.50 USD equivalent
- **Maximum**: Varies by region (typically $50-500 per transaction)
- **Supported Regions**: Africa, South Asia, Southeast Asia

## Sandbox vs Production

### Sandbox Mode

Use for testing:

```env
PAYCREST_ENV=sandbox
PAYCREST_API_KEY=sandbox_test_key
PAYCREST_WEBHOOK_SECRET=sandbox_webhook_secret
```

Access sandbox dashboard: https://sandbox.paycrest.com

**Sandbox Paj Cash Testing**:
- Use test Paj Cash account: `test@pajcash.com`
- Test PIN: `1234`
- Any amount will process successfully in sandbox

### Production Mode

Use for live payments:

```env
PAYCREST_ENV=production
PAYCREST_API_KEY=paycrest_live_key
PAYCREST_WEBHOOK_SECRET=paycrest_webhook_secret
```

## Testing Credentials

For sandbox testing, use these test cards and accounts:

| Type | Card/Account | Expiry | CVV/PIN |
|------|-------------|--------|---------|
| Visa Success | 4111111111111111 | 12/25 | 123 |
| Visa Decline | 4000000000000002 | 12/25 | 123 |
| Mastercard | 5555555555554444 | 12/25 | 123 |
| Mobile Money | +1234567890 | N/A | 0000 |
| Paj Cash Test | test@pajcash.com | N/A | 1234 |

## Deployment Checklist

- [ ] Create Paycrest business account
- [ ] Generate API credentials
- [ ] Enable all payment methods (Card, Mobile Money, Paj Cash)
- [ ] Set environment variables in `.env.local`
- [ ] Configure webhook endpoint
- [ ] Test payment flow with all methods in sandbox
- [ ] Update webhook URL for production
- [ ] Switch API keys to production
- [ ] Test with real payment using each method
- [ ] Monitor webhook logs
- [ ] Set up payment alerts/notifications
- [ ] Configure Paj Cash settlement preferences

## Troubleshooting

### Webhook Not Receiving Events

1. **Check webhook URL**: Ensure it's publicly accessible
2. **Verify signature**: Check `PAYCREST_WEBHOOK_SECRET` matches dashboard
3. **Check logs**: Review webhook delivery logs in Paycrest dashboard
4. **Test webhook**: Use Paycrest dashboard test webhook feature

### Payment Session Not Creating

1. **Verify API Key**: Check `PAYCREST_API_KEY` is correct
2. **Check Business ID**: Ensure `PAYCREST_BUSINESS_ID` exists
3. **Environment mode**: Verify `PAYCREST_ENV` matches API key type
4. **Payment method**: Ensure selected method is enabled in merchant settings
5. **Check response**: Look for error in server logs

### Paj Cash Not Appearing

1. **Check merchant settings**: Verify Paj Cash is enabled
2. **Region availability**: Ensure your region supports Paj Cash
3. **Account verification**: Complete all KYC requirements
4. **API version**: Update to latest Paycrest API version

### Signature Verification Failing

1. **Exact secret match**: Copy webhook secret exactly from dashboard
2. **Encoding**: Ensure secret is treated as base64 string
3. **Recent changes**: New secret takes time to propagate
4. **Disable for testing**: Temporarily disable signature verification to debug

## Security Best Practices

1. **Never commit secrets**: Use environment variables only
2. **Rotate credentials**: Change webhook secret periodically
3. **HTTPS only**: All production endpoints must use HTTPS
4. **Rate limiting**: Implement rate limiting on payment endpoint
5. **Audit logs**: Log all payment transactions for compliance
6. **Monitor disputes**: Watch for chargebacks and disputes
7. **PCI compliance**: Never store full card numbers
8. **Paj Cash security**: Store encrypted Paj Cash tokens only

## Production Deployment

### Before Going Live

1. Test entire payment flow with all methods in sandbox
2. Set up monitoring and alerts for payment failures
3. Configure error notifications to admin email
4. Test webhook delivery with all payment methods
5. Document all environment variables
6. Back up payment records
7. Set up incident response plan
8. Test Paj Cash settlement flow

### Production Environment Variables

For Vercel/Deployment:

1. Go to project settings
2. Add environment variables:
   - `PAYCREST_API_KEY`
   - `PAYCREST_BUSINESS_ID`
   - `PAYCREST_WEBHOOK_SECRET`
   - `PAYCREST_ENV`
   - `NEXT_PUBLIC_APP_URL`
3. Redeploy with new environment variables

### Monitoring

Monitor these metrics:

- Payment success rate (by method)
- Average payment processing time
- Webhook delivery success rate
- Error rates and types
- Revenue and transaction volume
- Paj Cash settlement delays

## Paycrest API Rate Limits

- **Payment Creation**: 100 requests/minute per API key
- **Webhook Delivery**: Retries up to 5 times over 24 hours
- **Status Checks**: 1000 requests/minute per API key
- **Paj Cash Lookups**: 50 requests/minute per API key

## Support & Documentation

- **Paycrest Docs**: https://docs.paycrest.com
- **API Reference**: https://api.paycrest.com/docs
- **Paj Cash Integration**: https://docs.paycrest.com/paj-cash
- **Support Email**: support@paycrest.com
- **Status Page**: https://status.paycrest.com
- **Community Forum**: https://community.paycrest.com

## Regional Considerations

### Supported Countries

Paycrest supports payments in:
- 🇬🇧 United Kingdom
- 🇳🇬 Nigeria
- 🇬🇭 Ghana
- 🇰🇪 Kenya
- 🇺🇬 Uganda
- 🇿🇦 South Africa
- And more...

**Paj Cash** is available in:
- 🇳🇬 Nigeria
- 🇬🇭 Ghana
- 🇰🇪 Kenya
- 🇵🇰 Pakistan
- 🇧🇩 Bangladesh
- Regional expansion ongoing

Check your region's supported payment methods in the dashboard.

### Currency Support

- **Primary**: USD (US Dollar)
- **Alternative**: Local currencies (NGN, GHS, KES, UGX, PKR, BDT, etc.)
- **Conversion**: Automatic conversion handled by Paycrest
- **Paj Cash**: Supports multi-currency settlements

## Compliance

Paycrest complies with:
- PCI DSS Level 1
- GDPR (EU)
- FinCEN (US)
- FINTRAC (Canada)
- Local regulations by country

Paj Cash complies with:
- Financial regulations in all supported countries
- KYC/AML requirements
- Data protection standards

For compliance questions, contact Paycrest support.

## Paj Cash Fee Structure

| Transaction Amount | Fee % | Max Fee |
|-------------------|-------|---------|
| $0.50 - $10 | 2.5% | $0.25 |
| $10 - $100 | 2.0% | $2.00 |
| $100+ | 1.5% | No cap |

*Fees are configurable in merchant settings*
