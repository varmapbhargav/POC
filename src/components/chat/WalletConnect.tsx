import { Button } from '@/components/ui/button';
import { useWallet } from '@/lib/wallet/wallet-context';
import { truncateEthAddress } from '@/lib/utils';
import { Loader2, LogOut, Wallet } from 'lucide-react';

export function WalletConnect() {
  const { address, isConnecting, isConnected, connect, disconnect } = useWallet();

  if (isConnecting) {
    return (
      <Button disabled variant="outline" size="sm">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Connecting...
      </Button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <Wallet className="mr-2 h-4 w-4" />
          {truncateEthAddress(address)}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={disconnect}
          className="text-destructive"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={connect} variant="outline" size="sm">
      <Wallet className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  );
}
