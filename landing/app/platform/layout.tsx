'use client';

import { AuthProvider } from './auth/auth-context';
import { ToastProvider } from './auth/toast-context';
import { ToastContainer } from './components/toast-container';

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <AuthProvider>
        <ToastContainer />
        {children}
      </AuthProvider>
    </ToastProvider>
  );
}
