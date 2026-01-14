import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fost - AI-Powered SDK Generation',
  description:
    'Generate production-ready SDKs for Web2 & Web3 in minutes using our intelligent CLI.',
  keywords:
    'SDK, generator, Web3, Web2, AI, CLI, TypeScript, automation, Fost',
  authors: [{ name: 'Fost Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <style dangerouslySetInnerHTML={{__html: `
          html {
            background: linear-gradient(
              -45deg,
              #ffffff 0%,
              #f0fdf4 20%,
              #f9fafb 40%,
              #ecfdf5 60%,
              #f3f4f6 80%,
              #ffffff 100%
            ) !important;
            background-size: 400% 400% !important;
            animation: gradientShift 20s ease infinite !important;
            background-attachment: fixed !important;
          }
          
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}} />
      </head>
      <body className="text-gray-900 antialiased" style={{ background: 'transparent' }}>
        {children}
      </body>
    </html>
  );
}
