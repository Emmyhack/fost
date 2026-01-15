'use client';

import { AuthProvider } from './auth/auth-context';
import { ToastProvider } from './auth/toast-context';
import { Web3Provider } from './auth/web3-context';
import { ToastContainer } from './components/toast-container';

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <AuthProvider>
        <Web3Provider>
          <ToastContainer />
          {children}
        </Web3Provider>
      </AuthProvider>
    </ToastProvider>
  );
}
