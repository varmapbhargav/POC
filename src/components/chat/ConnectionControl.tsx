import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useWaku } from '@/lib/waku/waku-context';
import { Loader2, Power, Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useEffect } from 'react';

export function ConnectionControl() {
  const { isInitialized, isConnecting, peers, connect, disconnect, error, clearError } = useWaku();
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: 'Connection Error',
        description: error,
        variant: 'destructive',
      });
      clearError();
    }
  }, [error, toast, clearError]);

  return (
    <div className="flex items-center gap-4">
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

      <Button
        variant={isInitialized ? "destructive" : "default"}
        size="sm"
        onClick={isInitialized ? disconnect : connect}
        disabled={isConnecting}
        className="relative"
      >
        <AnimatePresence mode="wait">
          {isConnecting ? (
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
