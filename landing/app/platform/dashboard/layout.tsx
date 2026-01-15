'use client';

import { Web3Provider } from '../auth/web3-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Web3Provider>
      {children}
    </Web3Provider>
  );
}
