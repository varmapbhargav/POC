import React, { createContext, useContext, useEffect, useState } from 'react';
import { wakuService, ChatMessage } from './waku-service';

/**
 * Interface defining the shape of the Waku context.
 * This provides access to Waku-related state and methods for interacting with the Waku network.
 */
interface WakuContextType {
  isInitialized: boolean; // Indicates whether the Waku node is initialized and connected.
  isConnecting: boolean; // Indicates whether the Waku node is currently connecting.
  error: string | null; // Stores any error messages related to Waku operations.
  sendMessage: (message: string, nick: string, address: string, file?: File) => Promise<boolean>; // Sends a message over the Waku network.
  messages: ChatMessage[]; // List of received messages.
  peers: number; // Number of connected peers.
  connect: () => Promise<void>; // Connects to the Waku network.
  disconnect: () => Promise<void>; // Disconnects from the Waku network.
  clearError: () => void; // Clears any error messages.
}

/**
 * Creates a React context for Waku functionality.
 * This context provides a centralized way to manage Waku-related state and operations.
 */
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

/**
 * WakuProvider is a React component that wraps the application and provides Waku functionality.
 * It initializes the Waku node, manages connections, and handles message sending/receiving.
 * @param {React.ReactNode} children - The child components to be wrapped by the provider.
 */
export function WakuProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false); // Tracks if the Waku node is initialized.
  const [isConnecting, setIsConnecting] = useState(false); // Tracks if the Waku node is connecting.
  const [error, setError] = useState<string | null>(null); // Stores error messages.
  const [messages, setMessages] = useState<ChatMessage[]>([]); // Stores received messages.
  const [peers, setPeers] = useState(0); // Tracks the number of connected peers.
  const [peerInterval, setPeerInterval] = useState<NodeJS.Timeout | null>(null); // Interval for peer count updates.

  /**
   * Starts periodic updates to the peer count.
   * This function fetches the peer count immediately and sets up an interval for updates.
   */
  const startPeerUpdates = () => {
    // Fetch peer count immediately
    wakuService.getPeerCount().then(setPeers);
    
    // Set up interval for periodic updates
    const interval = setInterval(async () => {
      const peerCount = await wakuService.getPeerCount();
      setPeers(peerCount);
    }, 5000); // Update every 5 seconds
    setPeerInterval(interval);
  };

  /**
   * Stops periodic updates to the peer count.
   * This function clears the interval used for peer count updates.
   */
  const stopPeerUpdates = () => {
    if (peerInterval) {
      clearInterval(peerInterval);
      setPeerInterval(null);
    }
  };

  /**
   * Clears any error messages.
   */
  const clearError = () => setError(null);

  /**
   * Connects to the Waku network.
   * This function initializes the Waku node, subscribes to messages, and starts peer updates.
   */
  const connect = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      // Initialize the Waku node
      const success = await wakuService.init();
      setIsInitialized(success);

      if (success) {
        // Subscribe to incoming messages
        wakuService.onMessage((message) => {
          setMessages((prev) => {
            // Deduplicate messages based on timestamp, nick, and message content
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
        // Start peer count updates
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

  /**
   * Disconnects from the Waku network.
   * This function stops the Waku node and clears related state.
   */
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

  /**
   * Cleans up when the component unmounts.
   * This stops peer updates and disconnects the Waku node.
   */
  useEffect(() => {
    return () => {
      stopPeerUpdates();
      wakuService.stop();
    };
  }, []);

  /**
   * Sends a message over the Waku network.
   * @param {string} message - The message content.
   * @param {string} nick - The sender's nickname.
   * @param {string} address - The sender's wallet address.
   * @param {File} [file] - Optional file to send with the message.
   * @returns {Promise<boolean>} - True if the message was sent successfully, otherwise false.
   */
  const sendMessage = async (message: string, nick: string, address: string, file?: File) => {
    setError(null);
    try {
      if (!address) {
        setError('Wallet not connected');
        return false;
      }

      // Send the message using the Waku service
      const success = await wakuService.sendMessage(message, nick, address, file);
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

/**
 * Custom hook to access the Waku context.
 * This hook provides access to Waku-related state and methods.
 * @returns {WakuContextType} - The Waku context.
 */
export function useWaku() {
  return useContext(WakuContext);
}