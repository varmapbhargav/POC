import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
  connectorsForWallets,
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
} from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { WagmiConfig } from 'wagmi';

const projectId = 'YOUR_PROJECT_ID'; // Get from WalletConnect Cloud

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, polygon, optimism, arbitrum],
  [publicProvider()]
);

const { wallets } = getDefaultWallets({
  appName: 'Waku Chat',
  projectId,
  chains,
});

const connectors = connectorsForWallets([
  ...wallets,
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

export { 
  wagmiConfig, 
  chains, 
  WagmiConfig, 
  RainbowKitProvider, 
  darkTheme,
  projectId,
};
