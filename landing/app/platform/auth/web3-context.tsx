'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { isValidEthereumProvider, isValidAddress, isValidChainId } from '@/lib/web3-validation';

export interface Web3ContextType {
  address: string | null;
  chainId: number | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchChain: (chainId: number) => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only initialize MetaMask if it exists
  const hasMetaMask = typeof window !== 'undefined' && !!(window as any).ethereum;

  useEffect(() => {
    // Don't auto-connect on load to avoid errors
    if (!hasMetaMask) return;

    let isMounted = true;

    const checkMetaMask = async () => {
      try {
        const ethereum = (window as any).ethereum;

        // Verify ethereum provider is valid
        if (!isValidEthereumProvider(ethereum)) {
          if (isMounted) {
            setError('Invalid Ethereum provider');
          }
          return;
        }

        // Listen for account changes
        if (ethereum.on) {
          ethereum.on('accountsChanged', (accounts: string[]) => {
            if (isMounted) {
              const account = accounts[0];
              if (account && isValidAddress(account)) {
                setAddress(account);
                setError(null);
              } else {
                setAddress(null);
              }
            }
          });

          // Listen for chain changes
          ethereum.on('chainChanged', (chainIdHex: string) => {
            if (isMounted) {
              try {
                const newChainId = parseInt(chainIdHex, 16);
                if (isValidChainId(newChainId)) {
                  setChainId(newChainId);
                  setError(null);
                }
              } catch (e) {
                setError('Invalid chain ID received');
              }
            }
          });
        }

        // Try to get current account if already connected (without triggering popup)
        if (ethereum.request) {
          try {
            const accounts = await ethereum.request({
              method: 'eth_accounts',
            });
            
            if (isMounted && accounts && accounts.length > 0) {
              const account = accounts[0];
              if (isValidAddress(account)) {
                setAddress(account);
              }
              
              const chainIdHex = await ethereum.request({
                method: 'eth_chainId',
              });
              if (isMounted) {
                const newChainId = parseInt(chainIdHex, 16);
                if (isValidChainId(newChainId)) {
                  setChainId(newChainId);
                }
              }
            }
          } catch (e) {
            // eth_accounts failed, which is fine
            if (isMounted) {
              console.debug('Could not fetch eth_accounts');
            }
          }
        }
      } catch (error) {
        // Silent fail - user may not have MetaMask or it's not available
        if (isMounted) {
          console.debug('MetaMask initialization failed (normal if MetaMask not installed)');
        }
      }
    };

    checkMetaMask();

    return () => {
      isMounted = false;
      if (hasMetaMask) {
        try {
          const ethereum = (window as any).ethereum;
          if (ethereum && ethereum.removeAllListeners) {
            ethereum.removeAllListeners();
          }
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [hasMetaMask]);

  const connectWallet = async () => {
    if (!hasMetaMask) {
      setError('Please install MetaMask to connect your wallet');
      return;
    }

    setIsConnecting(true);
    setError(null);
    try {
      const ethereum = (window as any).ethereum;
      
      if (!isValidEthereumProvider(ethereum)) {
        throw new Error('MetaMask is not available or invalid');
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      if (accounts && accounts.length > 0 && isValidAddress(accounts[0])) {
        setAddress(accounts[0]);
        
        const chainIdHex = await ethereum.request({
          method: 'eth_chainId',
        });
        const newChainId = parseInt(chainIdHex, 16);
        if (isValidChainId(newChainId)) {
          setChainId(newChainId);
        }
      }
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      
      if (error.code === 4001) {
        // User rejected the request
        setError('Connection rejected by user');
      } else if (error.message?.includes('MetaMask')) {
        setError('MetaMask error: ' + error.message);
      } else {
        setError('Failed to connect wallet');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setChainId(null);
    setError(null);
  };

  const switchChain = async (targetChainId: number) => {
    if (!hasMetaMask) {
      setError('Please install MetaMask');
      return;
    }

    if (!isValidChainId(targetChainId)) {
      setError('Invalid chain ID');
      return;
    }

    setError(null);
    try {
      const ethereum = (window as any).ethereum;
      const chainIdHex = '0x' + targetChainId.toString(16);
      
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          setError('Chain not available in MetaMask');
        } else {
          throw switchError;
        }
      }
    } catch (error) {
      console.error('Failed to switch chain:', error);
      setError('Failed to switch chain');
    }
  };

  return (
    <Web3Context.Provider
      value={{
        address,
        chainId,
        isConnecting,
        isConnected: !!address,
        error,
        connectWallet,
        disconnectWallet,
        switchChain,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within Web3Provider');
  }
  return context;
}
