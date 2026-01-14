# Fost Landing Site

A modern, developer-friendly landing site for an AI-powered SDK generator (Web2 + Web3). Built with Next.js, TypeScript, and Tailwind CSS.

## 🎨 Design Philosophy

- **Simple & Aesthetic**: Clean typography, generous spacing, no gradients
- **Green Accent Color**: `#10B981` used strategically for CTAs, icons, and highlights
- **Neutral Backgrounds**: White and light grey—never green backgrounds
- **Mobile-First**: Fully responsive design optimized for all devices
- **Educational Focus**: Step-by-step CLI walkthrough, AI explanation, code examples

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
cd landing
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## 📁 Project Structure

```
landing/
├── app/
│   ├── components/
│   │   ├── Hero.tsx              # Main hero section with headline & CTAs
│   │   ├── HowItWorks.tsx        # 4-step CLI walkthrough
│   │   ├── Features.tsx          # Feature cards grid
│   │   ├── CodeExamples.tsx      # Web2 & Web3 SDK examples
│   │   ├── AIExplainer.tsx       # AI design system & FAQ
│   │   ├── CodeBlock.tsx         # Reusable code block component
│   │   └── Footer.tsx            # CTA section & footer
│   ├── constants.ts              # Centralized content & config
│   ├── globals.css               # Global styles & animations
│   ├── layout.tsx                # Root layout with metadata
│   └── page.tsx                  # Main landing page
├── public/                       # Static assets (favicon, images, etc.)
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS customization
├── tsconfig.json                 # TypeScript configuration
└── package.json
```

## 🎯 Key Features

### Sections

1. **Hero**: Attention-grabbing headline, subtitle, and dual CTAs
2. **How It Works**: 4-step visual guide with code snippets & terminal output
3. **Features**: 6 feature cards highlighting key capabilities
4. **Code Examples**: Side-by-side Web2 & Web3 SDK examples
5. **AI Explainer**: Explains AI design system, control, and determinism
6. **FAQ**: Collapsible Q&A for developer concerns
7. **CTA & Footer**: Final call-to-action and navigation

### Interactive Elements

- **Code Block Component**: Copy button, syntax highlighting, terminal styling
- **Collapsible FAQ**: Smooth open/close animations
- **Hover Effects**: Subtle green highlights and shadow transitions
- **Animations**: Fade-in and slide-up effects for engagement

## 🎨 Customization Guide

### Update Site Copy & Links

Edit [app/constants.ts](app/constants.ts):

```typescript
export const SITE_CONFIG = {
  title: 'Fost',
  github: 'https://github.com/yourorg/fost',
  npm: 'https://www.npmjs.com/package/fost',
  docs: 'https://docs.example.com',
  // ... etc
};

export const STEPS = [
  // Update the 4-step walkthrough
];

export const FEATURES = [
  // Update feature cards
];

export const WEB2_EXAMPLE = { /* ... */ };
export const WEB3_EXAMPLE = { /* ... */ };
```

### Update Colors

Edit [tailwind.config.ts](tailwind.config.ts):

```typescript
colors: {
  'accent-green': '#10B981',           // Primary accent
  'accent-green-light': '#ECFDF5',     // Light variant
  'accent-green-dark': '#059669',      // Dark variant
  // ... other colors
}
```

### Typography

Edit [app/globals.css](app/globals.css) to customize fonts, sizes, and spacing.

### Add New Sections

1. Create a new component in `app/components/`
2. Import in `app/page.tsx`
3. Add between existing sections with dividers:

```tsx
<section className="...">
  {/* Your component */}
</section>

<div className="h-px bg-gray-200"></div>

<YourNewComponent />
```

## 📱 Responsive Design

All sections are mobile-first responsive using Tailwind's breakpoints:

- **Mobile**: `default` (no prefix)
- **Tablet**: `sm:` (≥640px), `md:` (≥768px)
- **Desktop**: `lg:` (≥1024px), `xl:` (≥1280px)

Test on mobile by resizing your browser or using DevTools.

## 🎬 Animations

Animations defined in [app/globals.css](app/globals.css):

- `animate-fade-in`: Smooth opacity transition
- `animate-slide-up`: Slide up with fade effect
- `card-hover`: Subtle shadow & border color change

Customize animation timing and delays:

```tsx
<div 
  className="animate-slide-up"
  style={{ animationDelay: '100ms' }}
>
  Content
</div>
```

## 🔧 Styling & Tailwind

The site uses Tailwind CSS for all styling. Key utilities:

- `bg-white`, `bg-gray-50` — Backgrounds
- `text-accent-green` — Accent text
- `border-accent-green` — Accent borders
- `hover:bg-accent-green` — Hover states
- `rounded-lg`, `shadow-md` — Spacing & shadows
- `flex`, `grid` — Layouts

All styles are configured in [tailwind.config.ts](tailwind.config.ts).

## 📝 Component API

### CodeBlock

Reusable code snippet component with copy button.

```tsx
<CodeBlock 
  code="npm install fost"
  isTerminal={false}
  language="bash"
/>
```

Props:
- `code: string` — Code to display
- `isTerminal?: boolean` — Render as terminal (default: false)
- `language?: string` — Language hint (default: typescript)

### Features Card

Auto-renders from FEATURES array in constants. Each feature:

```typescript
{
  title: string,
  description: string,
  icon: string,  // emoji
}
```

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### GitHub Pages

Build and deploy manually:

```bash
npm run build
# Upload ./out to GitHub Pages
```

## 🔍 Performance

- **Static Rendering**: Pages pre-rendered at build time
- **Image Optimization**: Use Next.js `Image` component
- **Code Splitting**: Components split automatically by Next.js
- **Lighthouse**: Target 90+ on all metrics

Check performance:

```bash
npm run build  # See build output metrics
```

## 🐛 Troubleshooting

### Build fails with module not found

Ensure all imports use relative paths (not `@/` alias for app-level constants):

```tsx
// ✓ Correct
import { SITE_CONFIG } from '../constants';

// ✗ Avoid
import { SITE_CONFIG } from '@/constants';
```

### Styles not applying

1. Clear cache: `rm -rf .next`
2. Rebuild: `npm run build`
3. Check Tailwind config includes all file paths

### Dev server slow

- Restart dev server: `npm run dev`
- Check for TypeScript errors: `npm run lint`

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## 📄 License

MIT — Feel free to use, modify, and distribute.

## 🤝 Contributing

Contributions welcome! Please follow the existing code style and component patterns.

---

**Built with ❤️ by the Fost Team**
