import { Button } from '@/components/ui/button';
import { useWallet } from '@/lib/wallet/wallet-context';
import { useWaku } from '@/lib/waku/waku-context';
import { Loader2, Wallet } from 'lucide-react';
import { truncateEthAddress } from '@/lib/utils';

export function WalletConnect() {
  const { isConnected, address, isConnecting, connect: connectWallet, disconnect: disconnectWallet } = useWallet();
  const { isInitialized, disconnect: disconnectWaku } = useWaku();

  const handleDisconnect = async () => {
    if (isInitialized) {
      await disconnectWaku();
    }
    await disconnectWallet();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={isConnected ? handleDisconnect : connectWallet}
      disabled={isConnecting}
    >
      {isConnecting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="mr-2 h-4 w-4" />
          {isConnected ? truncateEthAddress(address || '') : 'Connect Wallet'}
        </>
      )}
    </Button>
  );
}
