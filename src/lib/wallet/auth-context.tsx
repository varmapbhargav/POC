import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiweMessage } from 'siwe';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  isAuthenticated: boolean;
  nickname: string | null;
  setNickname: (nickname: string) => void;
  signIn: () => Promise<boolean>;
  signOut: () => void;
  address: string | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  nickname: null,
  setNickname: () => {},
  signIn: async () => false,
  signOut: () => {},
  address: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [nickname, setNickname] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const { toast } = useToast();

  // Load nickname from localStorage
  useEffect(() => {
    const savedNickname = localStorage.getItem('nickname');
    const myNickname: string | null = savedNickname !== undefined ? savedNickname : null;
    if (myNickname) {
      setNickname(myNickname);
    }
  }, []);

  // Handle wallet disconnection
  useEffect(() => {
    if (!isConnected) {
      setIsAuthenticated(false);
    }
  }, [isConnected]);

  const signIn = async () => {
    try {
      if (!address) return false;

      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in to Waku Chat',
        uri: window.location.origin,
        version: '1',
        chainId: 1,
        nonce: Math.random().toString(36).slice(2),
      });

      const signature = await signMessageAsync({
        message: message.prepareMessage(),
      });

      // In a real app, you'd verify this on the backend
      // For this demo, we'll just set authenticated if signature exists
      if (signature) {
        setIsAuthenticated(true);
        toast({
          title: 'Welcome!',
          description: 'You have successfully signed in.',
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to sign in:', error);
      toast({
        title: 'Sign In Failed',
        description: 'Failed to sign in with your wallet.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const signOut = () => {
    disconnect();
    setIsAuthenticated(false);
    setNickname(null);
    localStorage.removeItem('nickname');
    toast({
      title: 'Signed Out',
      description: 'You have been signed out.',
    });
  };

  const updateNickname = (newNickname: string) => {
    setNickname(newNickname);
    localStorage.setItem('nickname', newNickname);
  };

  const addressValue = address !== undefined ? address : null;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        nickname,
        setNickname: updateNickname,
        signIn,
        signOut,
        address: addressValue,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
