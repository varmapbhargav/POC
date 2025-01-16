import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useWaku } from '@/lib/waku/waku-context';
import { useWallet } from '@/lib/wallet/wallet-context';
import { Loader2, Power, Users } from 'lucide-react';
import { toast } from 'sonner';

export function ConnectionControl() {
  // Wallet context
  const { isConnected, address } = useWallet();

  // Waku context
  const { isInitialized, isConnecting, peers, connect, disconnect } = useWaku();

  /**
   * Handles the connection to the Waku network.
   * Ensures the wallet is connected before initializing Waku.
   */
  const handleConnect = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }
    await connect();
  };

  return (
    <div className="flex items-center gap-4">
      {/* Peer count display (only shown when Waku is initialized) */}
      <AnimatePresence mode="wait">
        {isInitialized && (
          <motion.div
            key="peer-count"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Users className="w-4 h-4" />
            <span>{peers} peers</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connect/Disconnect button */}
      <Button
        variant={isInitialized ? 'destructive' : 'default'}
        size="sm"
        onClick={isInitialized ? disconnect : handleConnect}
        disabled={isConnecting || !isConnected}
        className="relative"
      >
        <AnimatePresence mode="wait">
          {isConnecting ? (
            // Loading spinner animation
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
            </motion.div>
          ) : (
            // Connect/Disconnect button content
            <motion.div
              key="power"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Power className="w-4 h-4" />
              <span>{isInitialized ? 'Disconnect' : 'Connect'}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    </div>
  );
}