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
const CONTENT_TOPIC = '/waku/2/default-chat/proto'; // Content topic for Waku messages
const MAX_RETRIES = 5; // Maximum number of connection retries
const RETRY_DELAY = 3000; // Delay between retries in milliseconds
const PEER_MONITOR_INTERVAL = 10000; // Interval for peer monitoring in milliseconds

// Fallback nodes for better connectivity
const FALLBACK_NODES = [
  "/dns4/node-01.do-ams3.wakuv2.test.statusim.net/tcp/443/wss/p2p/16Uiu2HAmPLe7Mzm8TsYUubgCAW1aJoeFScxrLj8ppHFivPo97bUZ",
  "/dns4/node-01.gc-us-central1-a.wakuv2.test.statusim.net/tcp/443/wss/p2p/16Uiu2HAmJb2e28qLXxT5kZxVUUoJt72EMzNGXB47Rxx5hw3q4YjS",
  "/dns4/node-01.ac-cn-hongkong-c.wakuv2.test.statusim.net/tcp/443/wss/p2p/16Uiu2HAm6RsKx5d6HGHzJiNQXX4iNHKyngRQeX9kw9DBTW1w4iqk"
];

// Interface for file data
export interface FileData {
  name: string; // File name
  type: string; // File type (MIME type)
  size: number; // File size in bytes
  data: string; // Base64 encoded file data
}

// Interface for chat messages
export interface ChatMessage {
  timestamp: number; // Timestamp of the message
  message: string; // Message content
  nick: string; // Sender's nickname
  address: string; // Sender's address
  messageId?: string; // Optional unique message ID
  file?: FileData; // Optional file attachment
  signature?: string; // Optional message signature
  publicKey?: string; // Optional sender's public key
}

/**
 * WakuService class provides functionality to interact with the Waku network.
 * It includes methods for initializing the Waku node, sending and receiving messages,
 * and managing peer connections.
 */
class WakuService {
  private waku: LightNode | null = null; // Waku node instance
  private encoder: ReturnType<typeof createEncoder>; // Encoder for Waku messages
  private decoder: ReturnType<typeof createDecoder>; // Decoder for Waku messages
  private messageCallback: ((message: ChatMessage) => void) | null = null; // Callback for incoming messages
  private signer: ethers.Signer | null = null; // Ethereum signer for message signing
  private peerMonitorInterval: ReturnType<typeof setInterval> | null = null; // Interval for peer monitoring
  private isStarting: boolean = false; // Flag to track if the node is starting
  private isShuttingDown: boolean = false; // Flag to track if the node is shutting down
  private reconnectAttempt: number = 0; // Counter for reconnection attempts
  private unsubscribeFunction: (() => void) | null = null; // Function to unsubscribe from messages

  constructor() {
    // Initialize encoder and decoder with the content topic
    this.encoder = createEncoder({ contentTopic: CONTENT_TOPIC });
    this.decoder = createDecoder(CONTENT_TOPIC);
  }

  /**
   * Initializes the Waku node and connects to the network.
   * @param {ethers.Signer} [signer] - Optional signer for message signing.
   * @returns {Promise<boolean>} - True if initialization is successful, otherwise false.
   */
  async init(signer?: ethers.Signer): Promise<boolean> {
    // Prevent multiple initializations or shutdowns
    if (this.isStarting || this.isShuttingDown) return false;
    if (this.waku?.isStarted()) return true;

    try {
      this.isStarting = true;
      let retryCount = 0;

      // Retry connection up to MAX_RETRIES times
      while (retryCount < MAX_RETRIES) {
        try {
          console.log(`Attempting to connect (attempt ${retryCount + 1}/${MAX_RETRIES})...`);

          // Create and start the Waku node
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

          // Attempt to connect to fallback nodes
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

          // Throw error if no peers are connected
          if (connectedPeers === 0) {
            throw new Error('Failed to connect to any peers');
          }

          // Wait for remote peers to support required protocols
          await waitForRemotePeer(node, [
            Protocols.Filter,
            Protocols.LightPush
          ]);

          // Set the signer if provided
          if (signer) {
            this.signer = signer;
          }

          // Subscribe to messages and start peer monitoring
          await this.subscribeToMessages();
          this.startPeerMonitoring();
          this.reconnectAttempt = 0;

          return true;
        } catch (error) {
          console.error(`Connection attempt ${retryCount + 1} failed:`, error);
          retryCount++;
          
          // Stop the node if it exists
          if (this.waku) {
            await this.waku.stop();
            this.waku = null;
          }

          // Throw error if max retries are reached
          if (retryCount === MAX_RETRIES) {
            throw error;
          }

          // Wait before retrying
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

  /**
   * Subscribes to messages on the Waku network.
   * @private
   * @returns {Promise<void>}
   */
  private async subscribeToMessages(): Promise<void> {
    if (!this.waku?.filter) return;

    try {
      // Callback to handle incoming messages
      const callback = async (wakuMessage: any): Promise<void> => {
        if (!wakuMessage.payload) return;

        try {
          // Decode and parse the message
          const messageString = new TextDecoder().decode(wakuMessage.payload);
          const messageData = JSON.parse(messageString) as ChatMessage;
          
          // Verify message signature if present
          if (messageData.signature && messageData.publicKey) {
            const messageHash = ethers.hashMessage(`${messageData.message}${messageData.timestamp}`);
            const recoveredAddress = ethers.recoverAddress(messageHash, messageData.signature);
            const expectedAddress = ethers.computeAddress(messageData.publicKey);
            
            // Reject message if signature verification fails
            if (recoveredAddress.toLowerCase() !== expectedAddress.toLowerCase()) {
              console.warn('Message signature verification failed');
              return;
            }
          }

          // Pass the message to the callback if set
          if (this.messageCallback) {
            this.messageCallback(messageData);
          }
        } catch (error) {
          console.error('Failed to process message:', error);
        }
      };

      // Subscribe to messages using the decoder
      this.unsubscribeFunction = await this.waku.filter.subscribe([this.decoder], callback);
    } catch (error) {
      console.error('Failed to subscribe to messages:', error);
    }
  }

  /**
   * Sends a message over the Waku network.
   * @param {string} message - The message to send.
   * @param {string} nick - The nickname of the sender.
   * @param {string} address - The address of the sender.
   * @param {File} [file] - Optional file to send with the message.
   * @returns {Promise<boolean>} - True if the message is sent successfully, otherwise false.
   */
  async sendMessage(message: string, nick: string, address: string, file?: File): Promise<boolean> {
    try {
      // Check if Waku and signer are initialized
      if (!this.waku || !this.signer) {
        toast.error('Please ensure both Waku and wallet are initialized');
        return false;
      }

      // Validate message content
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

      // Send message using LightPush protocol
      const result = await this.waku.lightPush.send(this.encoder, {
        payload: finalPayload
      });

      // Check if message delivery was successful
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

  /**
   * Processes a file to be sent over the Waku network.
   * @param {File} file - The file to process.
   * @returns {Promise<FileData | undefined>} - The processed file data or undefined if processing fails.
   */
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

  /**
   * Sets a callback for receiving messages.
   * @param {(message: ChatMessage) => void} callback - The callback function to handle incoming messages.
   */
  onMessage(callback: (message: ChatMessage) => void): void {
    this.messageCallback = callback;
  }

  /**
   * Gets the number of connected peers.
   * @returns {Promise<number>} - The number of connected peers.
   */
  async getPeerCount(): Promise<number> {
    if (!this.waku) return 0;
    const peers = await this.waku.connectionManager.getPeersByDiscovery();
    return Object.values(peers).flat().length;
  }

  /**
   * Gets the list of connected peers.
   * @returns {Promise<any[]>} - The list of connected peers.
   */
  async getPeers(): Promise<any[]> {
    if (!this.waku) return [];
    const peers = await this.waku.connectionManager.getPeersByDiscovery();
    return Object.values(peers).flat();
  }

  /**
   * Stops the Waku node and cleans up resources.
   * @returns {Promise<void>}
   */
  async stop(): Promise<void> {
    this.isShuttingDown = true;

    try {
      // Clear peer monitoring interval
      if (this.peerMonitorInterval) {
        clearInterval(this.peerMonitorInterval);
        this.peerMonitorInterval = null;
      }

      // Unsubscribe from messages
      if (this.unsubscribeFunction) {
        this.unsubscribeFunction();
        this.unsubscribeFunction = null;
      }

      // Stop the Waku node
      if (this.waku) {
        await this.waku.stop();
        this.waku = null;
      }

      // Clear callbacks and signer
      this.messageCallback = null;
      this.signer = null;
    } catch (error) {
      console.error('Error stopping Waku:', error);
    } finally {
      this.isShuttingDown = false;
    }
  }

  /**
   * Checks if the Waku node is initialized.
   * @returns {boolean} - True if the node is initialized, otherwise false.
   */
  isInitialized(): boolean {
    return this.waku !== null && !this.isShuttingDown && !this.isStarting;
  }

  /**
   * Starts monitoring the peer connections.
   * @private
   */
  private startPeerMonitoring(): void {
    if (this.peerMonitorInterval) {
      clearInterval(this.peerMonitorInterval);
    }

    // Set up interval to monitor peers
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

  /**
   * Attempts to reconnect to the Waku network.
   * @private
   * @returns {Promise<void>}
   */
  private async reconnect(): Promise<void> {
    try {
      await this.stop();
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      await this.init(this.signer || undefined);
    } catch (error) {
      console.error('Reconnection failed:', error);
    }
  }
}

// Export a singleton instance of WakuService
export const wakuService = new WakuService();