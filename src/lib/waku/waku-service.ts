import { 
  createLightNode, 
  waitForRemotePeer, 
  createEncoder,
  createDecoder,
  type LightNode,
  Protocols
} from '@waku/sdk';
import { bootstrap } from '@libp2p/bootstrap';
import { webSockets } from '@libp2p/websockets';
import { all } from '@libp2p/websockets/filters';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

// Constants
const CONTENT_TOPIC = '/waku/2/default-chat/proto';
const MAX_RETRIES = 5;
const RETRY_DELAY = 3000;
const PEER_MONITOR_INTERVAL = 10000;

// Fallback nodes for better connectivity
const FALLBACK_NODES = [
  "/dns4/node-01.do-ams3.wakuv2.test.statusim.net/tcp/443/wss/p2p/16Uiu2HAmPLe7Mzm8TsYUubgCAW1aJoeFScxrLj8ppHFivPo97bUZ",
  "/dns4/node-01.gc-us-central1-a.wakuv2.test.statusim.net/tcp/443/wss/p2p/16Uiu2HAmJb2e28qLXxT5kZxVUUoJt72EMzNGXB47Rxx5hw3q4YjS",
  "/dns4/node-01.ac-cn-hongkong-c.wakuv2.test.statusim.net/tcp/443/wss/p2p/16Uiu2HAm6RsKx5d6HGHzJiNQXX4iNHKyngRQeX9kw9DBTW1w4iqk"
];

export interface FileData {
  name: string;
  type: string;
  size: number;
  data: string;
}

export interface ChatMessage {
  timestamp: number;
  message: string;
  nick: string;
  address: string;
  messageId?: string;
  file?: FileData;
  signature?: string;
  publicKey?: string;
}

class WakuService {
  private waku: LightNode | null = null;
  private encoder: ReturnType<typeof createEncoder>;
  private decoder: ReturnType<typeof createDecoder>;
  private messageCallback: ((message: ChatMessage) => void) | null = null;
  private signer: ethers.Signer | null = null;
  private peerMonitorInterval: ReturnType<typeof setInterval> | null = null;
  private isStarting: boolean = false;
  private isShuttingDown: boolean = false;
  private reconnectAttempt: number = 0;

  constructor() {
    this.encoder = createEncoder({ contentTopic: CONTENT_TOPIC });
    this.decoder = createDecoder(CONTENT_TOPIC);
  }

  async init(signer?: ethers.Signer): Promise<boolean> {
    if (this.isStarting || this.isShuttingDown) return false;
    if (this.waku?.isStarted()) return true;

    try {
      this.isStarting = true;
      let retryCount = 0;

      while (retryCount < MAX_RETRIES) {
        try {
          console.log(`Attempting to connect (attempt ${retryCount + 1}/${MAX_RETRIES})...`);

          const node = await createLightNode({
            defaultBootstrap: false,
            libp2p: {
              addresses: { listen: [] },
              transports: [
                webSockets({
                  filter: all,
                  websocket: { rejectUnauthorized: false }
                })
              ],
              peerDiscovery: [
                bootstrap({
                  list: FALLBACK_NODES,
                  tagName: 'bootstrap',
                  tagValue: 50,
                  tagTTL: 300_000
                })
              ]
            }
          });

          await node.start();
          this.waku = node;

          // Connect to bootstrap nodes
          const bootstrapPromises = FALLBACK_NODES.map(async peer => {
            try {
              await node.dial(peer);
              return true;
            } catch (err) {
              console.warn(`Failed to dial ${peer}:`, err);
              return false;
            }
          });

          const results = await Promise.allSettled(bootstrapPromises);
          const connectedPeers = results.filter(r => r.status === 'fulfilled' && r.value).length;

          if (connectedPeers === 0) {
            throw new Error('Failed to connect to any peers');
          }

          await waitForRemotePeer(node, [
            Protocols.Filter,
            Protocols.LightPush
          ]);

          if (signer) {
            this.signer = signer;
          }

          await this.subscribeToMessages();
          this.startPeerMonitoring();
          this.reconnectAttempt = 0;

          return true;
        } catch (error) {
          console.error(`Connection attempt ${retryCount + 1} failed:`, error);
          retryCount++;
          
          if (this.waku) {
            await this.waku.stop();
            this.waku = null;
          }

          if (retryCount === MAX_RETRIES) {
            throw error;
          }

          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
      }

      return false;
    } catch (error) {
      console.error('Failed to initialize Waku:', error);
      return false;
    } finally {
      this.isStarting = false;
    }
  }

  private async subscribeToMessages(): Promise<void> {
    if (!this.waku?.filter) return;

    try {
      const callback = async (wakuMessage: any): Promise<void> => {
        if (!wakuMessage.payload) return;

        try {
          const messageString = new TextDecoder().decode(wakuMessage.payload);
          const messageData = JSON.parse(messageString) as ChatMessage;
          
          if (messageData.signature && messageData.publicKey) {
            const messageHash = ethers.hashMessage(`${messageData.message}${messageData.timestamp}`);
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

      await this.waku.filter.subscribe([this.decoder], callback);
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
      if (this.waku?.filter) {
        await this.waku.filter.unsubscribe();
      }

      // Stop the node
      if (this.waku) {
        await this.waku.stop();
        this.waku = null;
      }

      // Clear callbacks
      this.messageCallback = null;
      this.signer = null;
    } catch (error) {
      console.error('Error stopping Waku:', error);
    } finally {
      this.isShuttingDown = false;
    }
  }

  isInitialized(): boolean {
    return this.waku !== null && !this.isShuttingDown && !this.isStarting;
  }

  private startPeerMonitoring(): void {
    if (this.peerMonitorInterval) {
      clearInterval(this.peerMonitorInterval);
    }

    this.peerMonitorInterval = setInterval(async () => {
      if (!this.waku || this.isShuttingDown) return;

      try {
        const peers = await this.getPeers();
        if (peers.length === 0 && this.reconnectAttempt < MAX_RETRIES) {
          console.log('No peers connected, attempting to reconnect...');
          this.reconnectAttempt++;
          await this.reconnect();
        }
      } catch (error) {
        console.error('Peer monitoring error:', error);
      }
    }, PEER_MONITOR_INTERVAL);
  }

  private async reconnect(): Promise<void> {
    try {
      await this.stop();
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      await this.init(this.signer);
    } catch (error) {
      console.error('Reconnection failed:', error);
    }
  }
}

export const wakuService = new WakuService();