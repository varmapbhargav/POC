import React, { createContext, useContext, useEffect, useState } from 'react';
import { wakuService, ChatMessage } from './waku-service';

interface WakuContextType {
  isInitialized: boolean;
  isConnecting: boolean;
  error: string | null;
  sendMessage: (message: string, nick: string, address: string) => Promise<boolean>;
  messages: ChatMessage[];
  peers: number;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  clearError: () => void;
}

const WakuContext = createContext<WakuContextType>({
  isInitialized: false,
  isConnecting: false,
  error: null,
  sendMessage: async () => false,
  messages: [],
  peers: 0,
  connect: async () => {},
  disconnect: async () => {},
  clearError: () => {},
});

export function WakuProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [peers, setPeers] = useState(0);
  const [peerInterval, setPeerInterval] = useState<NodeJS.Timeout | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  const startPeerUpdates = () => {
    // First update immediately
    wakuService.getPeerCount().then(setPeers);
    
    const interval = setInterval(async () => {
      const peerCount = await wakuService.getPeerCount();
      setPeers(peerCount);
    }, 5000);
    setPeerInterval(interval);
  };

  const stopPeerUpdates = () => {
    if (peerInterval) {
      clearInterval(peerInterval);
      setPeerInterval(null);
    }
  };

  const clearError = () => setError(null);

  const connect = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const success = await wakuService.init();
      setIsInitialized(success);

      if (success) {
        // Subscribe to messages
        wakuService.onMessage((message) => {
          setMessages((prev) => {
            // Deduplicate messages based on timestamp and nick
            const isDuplicate = prev.some(
              (m) => 
                m.timestamp === message.timestamp && 
                m.nick === message.nick &&
                m.message === message.message
            );
            if (isDuplicate) return prev;
            return [...prev, message];
          });
        });
        startPeerUpdates();
      } else {
        setError('Failed to initialize Waku node');
      }
    } catch (error) {
      console.error('Failed to connect:', error);
      setError('Failed to connect to the network');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    setError(null);
    try {
      await wakuService.stop();
      setIsInitialized(false);
      setPeers(0);
      stopPeerUpdates();
    } catch (error) {
      console.error('Failed to disconnect:', error);
      setError('Failed to disconnect from the network');
    }
  };

  useEffect(() => {
    return () => {
      stopPeerUpdates();
      wakuService.stop();
    };
  }, []);

  const sendMessage = async (message: string, nick: string, address: string) => {
    setError(null);
    try {
      if (!address) {
        setError('Wallet not connected');
        return false;
      }

      const success = await wakuService.sendMessage(message, nick, address);
      if (!success) {
        setError('Failed to send message');
      }
      return success;
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message');
      return false;
    }
  };

  return (
    <WakuContext.Provider
      value={{
        isInitialized,
        isConnecting,
        error,
        sendMessage,
        messages,
        peers,
        connect,
        disconnect,
        clearError,
      }}
    >
      {children}
    </WakuContext.Provider>
  );
}

export function useWaku() {
  return useContext(WakuContext);
}
