import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useWaku } from '@/lib/waku/waku-context';
import { useWallet } from '@/lib/wallet/wallet-context';
import { Send } from 'lucide-react';
import { FileUpload } from './FileUpload';
import { toast } from 'sonner';

export function MessageInput() {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { isInitialized, sendMessage } = useWaku();
  const { address, isConnected } = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!isInitialized) {
      toast.error('Please connect to Waku first');
      return;
    }

    const trimmedMessage = message.trim();
    if (!trimmedMessage && !selectedFile) {
      toast.error('Please enter a message or select a file');
      return;
    }

    try {
      setIsSending(true);
      const success = await sendMessage(
        trimmedMessage,
        "Anonymous",
        address,
        selectedFile || undefined
      );
      
      if (success) {
        setMessage('');
        setSelectedFile(null);
        textareaRef.current?.focus();
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

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, []);

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t bg-background">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-h-[44px] max-h-[150px] pr-12 resize-none"
            disabled={!isInitialized || !isConnected}
          />
          <div className="absolute right-2 bottom-2">
            <FileUpload
              onFileSelect={setSelectedFile}
              selectedFile={selectedFile}
            />
          </div>
        </div>
        <Button
          type="submit"
          size="icon"
          disabled={isSending || !isInitialized || !isConnected || (!message.trim() && !selectedFile)}
          className="flex-shrink-0"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
      {selectedFile && (
        <div className="mt-2 text-sm text-muted-foreground">
          Selected file: {selectedFile.name}
        </div>
      )}
    </form>
  );
}

export default MessageInput;