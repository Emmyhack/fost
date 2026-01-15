# FOST Quick Start - For Developers

## 🚀 Getting Started (5 minutes)

### Prerequisites
```bash
Node.js 18+
npm or yarn
MetaMask browser extension (optional, for testing Web3)
```

### Installation

```bash
# Navigate to landing directory
cd landing

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit: `http://localhost:3000`

## 📍 What You'll See

### Public Pages
- `/` - Landing page (Web3 marketing)
- `/web3-docs` - Feature documentation
- `/pricing` - Pricing plans

### Auth Pages
- `/platform/auth/login` - Sign in
- `/platform/auth/signup` - Create account

### Authenticated Pages
- `/platform/dashboard` - Main app (requires login)

## 🔑 Demo Credentials

**Email:** `demo@fost.dev`
**Password:** `demo12345`

These are hardcoded in `auth-handlers.ts` for demo purposes.

## 🎮 Testing the App

### 1. Create an Account
```
1. Click "Launch App" in nav
2. Click "Create Account"
3. Fill in name, email, password
4. Click "Create Account"
5. Redirected to dashboard
```

### 2. Explore the Dashboard
```
1. See your credits and plan
2. Note the "Connect Wallet" button (top right)
3. See SDK generation form (center)
4. View features list (right sidebar)
```

### 3. Test REST API SDK Generation
```
1. Enter project name: "my-api"
2. Select languages: TypeScript, Python
3. Click "Generate SDK"
4. See: "SDK generation started!"
```

### 4. Test Web3 SDK Generation (requires MetaMask)
```
1. Click "Connect Wallet" button
2. MetaMask popup appears
3. Select account and approve
4. See wallet connected in header
5. Toggle "Web3 Smart Contract" checkbox
6. Select chain: Ethereum
7. Enter contract address (any address)
8. Select languages
9. Click "Generate SDK"
```

### 5. Disconnect Wallet
```
1. Click wallet display or "Disconnect" button
2. Wallet status clears
3. Can reconnect by clicking "Connect Wallet"
```

## 📁 Key File Locations

### Core Platform
```
landing/app/platform/
├── auth/
│   ├── auth-context.tsx (User auth)
│   └── web3-context.tsx (Wallet management)
├── dashboard/
│   ├── layout.tsx (Web3 setup)
│   └── page.tsx (Main dashboard)
└── components/
    ├── dashboard-header.tsx (Header with wallet)
    ├── sdk-generator-form.tsx (Main form)
    └── wallet-connect.tsx (Wallet button)
```

### Pages
```
landing/app/
├── page.tsx (Landing)
├── web3-docs/page.tsx (Documentation)
├── pricing/page.tsx (Pricing)
└── components/navbar.tsx (Navigation)
```

### Configuration
```
tailwind.config.ts (Monospace fonts)
globals.css (Global styles)
```

## 🔧 Making Changes

### Change Colors
Edit `tailwind.config.ts`:
```typescript
colors: {
  'accent-green': '#10B981',          // Primary color
  'accent-green-light': '#ECFDF5',    // Hover
  'accent-green-dark': '#059669',     // Active
}
```

### Add Supported Chains
Edit `sdk-generator-form.tsx`:
```typescript
const chains = [
  { id: '1', name: 'Ethereum', symbol: 'ETH' },
  { id: '137', name: 'Polygon', symbol: 'MATIC' },
  // Add more here
];
```

### Add Languages
Edit `sdk-generator-form.tsx`:
```typescript
const languages = [
  'typescript',
  'python',
  // Add more here
];
```

### Change Pricing
Edit `pricing/page.tsx`:
```typescript
const plans = [
  {
    name: 'Free',
    price: '$0',
    // Edit pricing here
  },
];
```

## 📊 Understanding the Architecture

### Context Hierarchy
```
Platform Root
└── AuthProvider (manages user auth)
    ├── Login Page (auth only)
    ├── Signup Page (auth only)
    └── Dashboard
        └── Web3Provider (manages wallet)
            └── Dashboard Content
```

### Data Flow
```
User Input
    ↓
Component State (useState)
    ↓
Context Handler (useAuth, useWeb3)
    ↓
API Call (mock in auth-handlers.ts)
    ↓
Update UI
```

## 🧪 Common Tasks

### Add a New Page
1. Create `app/new-page/page.tsx`
2. Import components as needed
3. Use `useAuth()` if you need user info
4. Deploy with `vercel` or similar

### Add a New API Route
1. Create `app/api/route.ts`
2. Handle GET/POST requests
3. Call backend services
4. Return JSON response

### Test Without MetaMask
1. Open page in incognito mode
2. MetaMask extension won't load
3. Should see "Install MetaMask" message
4. Rest of app works normally

### Debug Web3 Connection
1. Open browser DevTools (F12)
2. Go to Console tab
3. Type: `window.ethereum`
4. Should see MetaMask object if installed
5. Check for errors in console

## 🚀 Deployment

### Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
# (add any needed in Vercel dashboard)

# View: https://your-project.vercel.app
```

### Deploy to Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=.next
```

## 🔐 Security Notes

### For Development
- Hardcoded demo credentials are just for testing
- MetaMask only requests what's needed
- No sensitive data stored locally

### For Production
- Replace mock auth with real backend
- Use environment variables for secrets
- Add rate limiting
- Implement proper error tracking
- Add CORS headers
- Use HTTPS everywhere

## 📚 Documentation

### Available Docs
- `METAMASK_ERROR_RESOLUTION.md` - How the error was fixed
- `WEB3_INTEGRATION_GUIDE.md` - Complete API reference
- `SAAS_PLATFORM_SUMMARY.md` - Platform overview
- `FOST_WEB3_POSITIONING.md` - Market strategy

### Generate New Docs
```bash
# No special setup needed
# Docs are in root and landing dirs
# Markdown files auto-created
```

## 🆘 Troubleshooting

### Page Won't Load
```bash
# Clear cache
rm -rf .next

# Reinstall
rm -rf node_modules
npm install

# Try again
npm run dev
```

### MetaMask Not Detecting
```
1. Make sure MetaMask is installed
2. Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Disable/re-enable extension
4. Check if running on localhost
```

### "Cannot find module" Error
```bash
npm install
npm run dev
```

### Wallet Won't Connect
```
1. Check MetaMask is unlocked
2. Try different account in MetaMask
3. Check browser console for errors
4. Try incognito mode (no cache)
```

## 📞 Support

### Resources
- Check troubleshooting above
- Read documentation in `landing/` directory
- Review component code (well-commented)
- Check browser DevTools console

### Common Issues
- **Auth not working:** Check `auth-handlers.ts` backend
- **SDK generation failing:** Check `sdk-service.ts` backend
- **MetaMask errors:** See `METAMASK_ERROR_RESOLUTION.md`
- **UI broken:** Clear cache and reinstall

## ✅ Next Steps

1. **Understand the structure**
   - Spend 10 minutes reading the architecture
   - Look at a few key components

2. **Test the app**
   - Try signup/login flow
   - Test Web3 connection with MetaMask
   - Explore all pages

3. **Make a small change**
   - Change a color or text
   - Add a new language
   - Customize a button

4. **Deploy**
   - Push to GitHub
   - Connect to Vercel
   - Share the URL

## 🎉 You're Ready!

The FOST Web3 SaaS platform is now running locally. Everything is wired up and ready for:
- Backend integration
- Real authentication
- Payment processing
- Production deployment

Happy building! 🚀
