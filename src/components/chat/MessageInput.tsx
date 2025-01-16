import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, X, Loader2, Image, FileText } from 'lucide-react';
import { useWaku } from '@/lib/waku/waku-context';
import { useWallet } from '@/lib/wallet/wallet-context';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function MessageInput() {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const { sendMessage } = useWaku();
  const { isConnected, address } = useWallet();
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      toast.error('File size exceeds 10MB limit', {
        description: 'Please select a smaller file'
      });
      return;
    }

    setFile(selectedFile);
    // Focus textarea after file selection
    setTimeout(() => document.querySelector('textarea')?.focus(), 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() && !file) return;
    if (!isConnected || !address) {
      toast.error('Connect wallet to send messages', {
        description: 'Please connect your wallet to participate in the chat'
      });
      return;
    }

    try {
      setIsSending(true);
      const success = await sendMessage(message.trim(), "", address);
      if (success) {
        setMessage('');
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        toast.success('Message sent successfully');
      } else {
        toast.error('Failed to send message', {
          description: 'Please try again'
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message', {
        description: 'An unexpected error occurred'
      });
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

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image;
    return FileText;
  };

  const FileIcon = file ? getFileIcon(file) : Paperclip;

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <AnimatePresence mode="wait">
        {file && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            className="mb-2 p-2 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-2 text-sm">
              <FileIcon className="h-4 w-4 text-primary" />
              <span className="truncate max-w-[200px] text-white/80">{file.name}</span>
              <span className="text-xs text-white/50">
                ({(file.size / 1024).toFixed(1)} KB)
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-white/10"
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
            onChange={(e) => {
              setMessage(e.target.value);
              setIsTyping(true);
              setTimeout(() => setIsTyping(false), 1000);
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              isConnected
                ? "Type your message..."
                : "Connect wallet to chat"
            }
            disabled={!isConnected || isSending}
            className={cn(
              "min-h-[44px] max-h-32 resize-none",
              "bg-white/5 border-white/10",
              "focus:border-white/20 focus:ring-1 focus:ring-white/20",
              "placeholder:text-white/50",
              "transition-all duration-200"
            )}
          />
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          />
          <div className="flex flex-col gap-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                disabled={!isConnected || isSending}
                className={cn(
                  "bg-white/5 border border-white/10",
                  "hover:bg-white/10 hover:border-white/20",
                  "transition-all duration-200"
                )}
              >
                <FileIcon className="h-4 w-4" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                type="submit" 
                size="icon"
                disabled={(!message.trim() && !file) || !isConnected || isSending}
                className={cn(
                  "bg-gradient-to-r from-blue-500 to-purple-500",
                  "hover:from-blue-600 hover:to-purple-600",
                  "disabled:from-gray-500 disabled:to-gray-600",
                  "transition-all duration-200"
                )}
              >
                <AnimatePresence mode="wait">
                  {isSending ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, rotate: 180 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: -180 }}
                    >
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="send"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                    >
                      <Send className="h-4 w-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.form>
  );
}

export default MessageInput;