import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface WalletContextType {
  address: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  isConnecting: false,
  isConnected: false,
  connect: async () => {},
  disconnect: () => {},
});

export const useWallet = () => useContext(WalletContext);

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  /**
   * Handles changes to the connected accounts.
   * Updates the address and connection state.
   */
  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      // No accounts connected
      setAddress(null);
      setIsConnected(false);
      localStorage.removeItem('walletConnected');
      toast.info('Wallet disconnected');
    } else {
      // Update the connected address
      setAddress(accounts[0]);
      setIsConnected(true);
      localStorage.setItem('walletConnected', 'true');
      toast.success('Wallet connected successfully');
    }
  }, []);

  /**
   * Connects to the wallet using `window.ethereum`.
   */
  const connect = async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask or an Ethereum-compatible wallet');
      return;
    }

    try {
      setIsConnecting(true);
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      handleAccountsChanged(accounts);
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      toast.error(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Disconnects the wallet by resetting the state.
   */
  const disconnect = () => {
    setAddress(null);
    setIsConnected(false);
    localStorage.removeItem('walletConnected');
    toast.info('Wallet disconnected');
  };

  /**
   * Initializes the wallet connection and sets up event listeners.
   */
  useEffect(() => {
    const initializeWallet = async () => {
      if (!window.ethereum) {
        return;
      }

      // Check if wallet was previously connected
      const wasConnected = localStorage.getItem('walletConnected') === 'true';
      if (wasConnected) {
        try {
          const accounts = await window.ethereum.request({ 
            method: 'eth_accounts' 
          });
          handleAccountsChanged(accounts);
        } catch (error) {
          console.error('Failed to fetch accounts:', error);
        }
      }

      // Listen for account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);

      // Listen for chain changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    };

    initializeWallet();

    return () => {
      if (window.ethereum) {
        // Clean up event listeners
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', () => {
          window.location.reload();
        });
      }
    };
  }, [handleAccountsChanged]);

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnecting,
        isConnected,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}