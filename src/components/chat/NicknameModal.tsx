import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';
import { useAuth } from '@/lib/wallet/auth-context';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Loader2 } from 'lucide-react';

interface NicknameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NicknameModal({ isOpen, onClose }: NicknameModalProps) {
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { address, isAuthenticated, signIn, setNickname: updateNickname } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (nickname.trim().length < 3) {
      toast.error('Nickname must be at least 3 characters long.');
      return;
    }

    if (!address) {
      toast.error('Please connect your wallet first.');
      return;
    }

    if (!isAuthenticated) {
      setIsLoading(true);
      const success = await signIn();
      setIsLoading(false);
      
      if (!success) {
        toast.error('Please try signing in with your wallet again.');
        return;
      }
    }

    updateNickname(nickname.trim());
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-background/80 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-white/10 max-w-md w-full"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl" />
            
            <div className="relative">
              <h2 className="text-2xl font-bold mb-4">Welcome to Chat</h2>
              <p className="text-muted-foreground mb-6">
                Connect your wallet and choose a nickname to start chatting.
              </p>

              <div className="space-y-6">
                <div className="flex justify-center">
                  <ConnectButton />
                </div>

                {address && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="Enter your nickname"
                      className="bg-white/10 border-white/20"
                      autoFocus
                      disabled={isLoading}
                    />
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={!nickname.trim() || isLoading}
                        className="bg-primary hover:bg-primary/90 relative"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Start Chatting'
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
