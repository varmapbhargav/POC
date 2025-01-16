import { createLightNode, waitForRemotePeer, type LightNode, Protocols, createEncoder, createDecoder, DecodedMessage } from '@waku/sdk';
import { ecies as Ecies } from '@waku/message-encryption';
import type { Unsubscribe } from '@waku/interfaces';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

export const CONTENT_TOPIC = '/waku/2/default-chat/proto';
const PEER_MONITOR_INTERVAL = 10000; // 10 seconds

export interface FileData {
  name: string;
  type: string;
  size: number;
  data: string; // base64 encoded
}

export interface ChatMessage {
  timestamp: number;
  message: string;
  nick: string;
  address: string;
  messageId?: string;
  file?: FileData;
  signature?: string;  // Ethereum signature
  publicKey?: string;  // Sender's public key
}

class WakuService {
  private waku: LightNode | null = null;
  private encoder: ReturnType<typeof createEncoder>;
  private decoder: ReturnType<typeof createDecoder>;
  private messageCallback: ((message: ChatMessage) => void) | null = null;
  private unsubscribeFunction: Unsubscribe | null = null;
  private signer: ethers.Signer | null = null;
  private eciesEncoder: ReturnType<typeof Ecies.createEncoder> | null = null;
  private peerMonitorInterval: ReturnType<typeof setInterval> | null = null;
  private isStarting: boolean = false;
  private isShuttingDown: boolean = false;

  constructor() {
    this.encoder = createEncoder({ contentTopic: CONTENT_TOPIC });
    this.decoder = createDecoder(CONTENT_TOPIC);
  }

  async connectWallet(): Promise<string> {
    if (typeof window.ethereum === 'undefined') {
      toast.error('MetaMask is not installed');
      throw new Error('MetaMask is not installed');
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      this.signer = await provider.getSigner();
      const address = await this.signer.getAddress();
      
      // Initialize ECIES encoder with the wallet's public key
      const publicKey = new ethers.SigningKey(await this.signer.getAddress()).compressedPublicKey;
      this.eciesEncoder = Ecies.createEncoder({
        pubsubTopic: this.encoder.pubsubTopic,
        contentTopic: CONTENT_TOPIC,
        publicKey: ethers.getBytes(publicKey)
      });
      toast.success('Wallet connected successfully!');
      return address;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error('Failed to connect wallet');
      throw error;
    }
  }

  async init(): Promise<boolean> {
    try {
      if (this.waku) {
        console.log('Waku already initialized');
        return true;
      }

      if (this.isStarting) {
        console.log('Waku initialization already in progress');
        return false;
      }

      this.isStarting = true;

      // Create and configure the node
      const node = await createLightNode({
        defaultBootstrap: true,
        libp2p: {
          addresses: {
            listen: ['/ip4/0.0.0.0/tcp/0/ws']
          }
        }
      });

      // Start the node
      await node.start();
      this.waku = node;

      // Wait for peer connection
      await waitForRemotePeer(node, [
        Protocols.Store,
        Protocols.Filter,
        Protocols.LightPush
      ]);

      // Start monitoring peers
      this.startPeerMonitoring();

      // Subscribe to messages
      await this.subscribeToMessages();
      
      this.isStarting = false;
      return true;
    } catch (error) {
      this.isStarting = false;
      console.error('Failed to initialize Waku:', error);
      return false;
    }
  }

  private startPeerMonitoring(): void {
    if (this.peerMonitorInterval) {
      clearInterval(this.peerMonitorInterval);
    }

    this.peerMonitorInterval = setInterval(async () => {
      if (!this.waku || this.isShuttingDown) return;

      try {
        const peerCount = await this.getPeerCount();
        if (peerCount === 0) {
          console.log('No peers connected, attempting to reconnect...');
          await waitForRemotePeer(this.waku, [
            Protocols.Store,
            Protocols.Filter,
            Protocols.LightPush
          ]);
        }
      } catch (error) {
        console.error('Peer monitoring error:', error);
      }
    }, PEER_MONITOR_INTERVAL);
  }

  private async subscribeToMessages(): Promise<void> {
    if (!this.waku) return;

    try {
      if (this.unsubscribeFunction) {
        await this.unsubscribeFunction();
        this.unsubscribeFunction = null;
      }

      const callback = async (wakuMessage: DecodedMessage): Promise<void> => {
        if (!wakuMessage.payload) return;

        try {
          const messageString = new TextDecoder().decode(wakuMessage.payload);
          const messageData = JSON.parse(messageString) as ChatMessage;
          
          // Verify message signature if present
          if (messageData.signature && messageData.publicKey) {
            const messageHash = ethers.hashMessage(messageData.message);
            const recoveredAddress = ethers.recoverAddress(messageHash, messageData.signature);
            const expectedAddress = ethers.computeAddress(messageData.publicKey);
            
            if (recoveredAddress.toLowerCase() !== expectedAddress.toLowerCase()) {
              console.warn('Message signature verification failed');
              return;
            }
          }

          if (this.messageCallback) {
            this.messageCallback(messageData);
          }
        } catch (error) {
          console.error('Failed to process message:', error);
        }
      };

      this.unsubscribeFunction = await this.waku.filter.subscribeWithUnsubscribe(
        [this.decoder],
        callback
      );
    } catch (error) {
      console.error('Failed to subscribe to messages:', error);
    }
  }

  async sendMessage(message: string, nick: string, address: string, file?: File): Promise<boolean> {
    try {
      // Check initialization
      if (!this.waku || !this.signer) {
        toast.error('Please ensure both Waku and wallet are initialized');
        return false;
      }

      // Validate message
      if (!message.trim() && !file) {
        toast.error('Message cannot be empty');
        return false;
      }

      // Process file if present
      let fileData: FileData | undefined;
      if (file) {
        fileData = await this.processFile(file);
        if (!fileData) {
          toast.error('Failed to process file');
          return false;
        }
      }

      // Create message payload
      const timestamp = Date.now();
      const messageToSign = `${message}${timestamp}`;
      const signature = await this.signer.signMessage(messageToSign);
      const publicKey = new ethers.SigningKey(await this.signer.getAddress()).compressedPublicKey;

      const payload: ChatMessage = {
        timestamp,
        message,
        nick: nick || address,
        address,
        signature,
        publicKey,
        file: fileData
      };

      // Encode and send message
      const finalPayload = new TextEncoder().encode(JSON.stringify(payload));

      if (!this.waku.lightPush) {
        toast.error('LightPush protocol not available');
        return false;
      }

      const result = await this.waku.lightPush.send(this.encoder, {
        payload: finalPayload
      });

      if (!result.successes.length) {
        toast.error('Failed to send message: No successful deliveries');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message: ' + (error as Error).message);
      return false;
    }
  }

  async processFile(file: File): Promise<FileData | undefined> {
    try {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64Data = reader.result as string;
          resolve({
            name: file.name,
            type: file.type,
            size: file.size,
            data: base64Data.split(',')[1] // Remove data URL prefix
          });
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Failed to process file:', error);
      return undefined;
    }
  }

  onMessage(callback: (message: ChatMessage) => void): void {
    this.messageCallback = callback;
  }

  async getPeerCount(): Promise<number> {
    if (!this.waku) return 0;
    const peers = await this.waku.connectionManager.getPeersByDiscovery();
    return Object.values(peers).flat().length;
  }

  async getPeers(): Promise<any[]> {
    if (!this.waku) return [];
    const peers = await this.waku.connectionManager.getPeersByDiscovery();
    return Object.values(peers).flat();
  }

  async stop(): Promise<void> {
    this.isShuttingDown = true;

    try {
      // Clear peer monitoring
      if (this.peerMonitorInterval) {
        clearInterval(this.peerMonitorInterval);
        this.peerMonitorInterval = null;
      }

      // Unsubscribe from messages
      if (this.unsubscribeFunction) {
        await this.unsubscribeFunction();
        this.unsubscribeFunction = null;
      }

      // Stop the node
      if (this.waku) {
        await this.waku.stop();
        this.waku = null;
      }

      // Clear callbacks
      this.messageCallback = null;
      this.signer = null;
      this.eciesEncoder = null;
    } catch (error) {
      console.error('Error stopping Waku:', error);
    } finally {
      this.isShuttingDown = false;
    }
  }

  isInitialized(): boolean {
    return this.waku !== null && !this.isShuttingDown && !this.isStarting;
  }
}

export const wakuService = new WakuService();