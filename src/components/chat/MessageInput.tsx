import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, X, Loader2 } from 'lucide-react';
import { useWaku } from '@/lib/waku/waku-context';
import { useWallet } from '@/lib/wallet/wallet-context';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export function MessageInput() {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const { sendMessage } = useWaku();
  const { isConnected, address } = useWallet();
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (selectedFile.size > maxSize) {
      toast.error('File size exceeds 10MB limit');
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() && !file) return;
    if (!isConnected || !address) {
      toast.error('Please connect your wallet to send messages');
      return;
    }

    try {
      setIsSending(true);
      // Use empty string for nick, it will use address as fallback
      const success = await sendMessage(message.trim(), "", address);
      if (success) {
        setMessage('');
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <AnimatePresence>
        {file && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-2 p-2 glass-effect rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-2 text-sm">
              <Paperclip className="h-4 w-4" />
              <span className="truncate max-w-[200px]">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                ({(file.size / 1024).toFixed(1)} KB)
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setFile(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2">
        <div className="flex-1 flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isConnected
                ? "Type your message..."
                : "Connect your wallet to chat"
            }
            disabled={!isConnected || isSending}
            className="min-h-[44px] max-h-32 glass-input"
          />
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          />
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              size="icon"
              variant="glass"
              onClick={() => fileInputRef.current?.click()}
              disabled={!isConnected || isSending}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button 
              type="submit" 
              size="icon"
              variant="default"
              disabled={(!message.trim() && !file) || !isConnected || isSending}
              className="relative"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}