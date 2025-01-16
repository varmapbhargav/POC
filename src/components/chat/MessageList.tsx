import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWaku } from '@/lib/waku/waku-context';
import { useWallet } from '@/lib/wallet/wallet-context';
import { User, FileIcon, Image as ImageIcon, Film, Music, FileText } from 'lucide-react';
import { truncateEthAddress } from '@/lib/utils';
import { format } from 'date-fns';
import type { FileData } from '@/lib/waku/waku-service';

function FilePreview({ file }: { file: FileData }) {
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  const isAudio = file.type.startsWith('audio/');
  const isPDF = file.type === 'application/pdf';
  const isDoc = file.type.includes('document') || file.type.includes('msword');
  const isText = file.type === 'text/plain';

  const getFileIcon = () => {
    if (isImage) return <ImageIcon className="h-4 w-4" />;
    if (isVideo) return <Film className="h-4 w-4" />;
    if (isAudio) return <Music className="h-4 w-4" />;
    if (isPDF || isDoc || isText) return <FileText className="h-4 w-4" />;
    return <FileIcon className="h-4 w-4" />;
  };

  return (
    <div className="mt-2">
      {isImage ? (
        <img
          src={`data:${file.type};base64,${file.data}`}
          alt={file.name}
          className="max-w-[300px] max-h-[200px] rounded-lg object-cover"
        />
      ) : (
        <a
          href={`data:${file.type};base64,${file.data}`}
          download={file.name}
          className="flex items-center gap-2 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
        >
          {getFileIcon()}
          <div className="flex flex-col">
            <span className="text-sm truncate max-w-[200px]">{file.name}</span>
            <span className="text-xs text-muted-foreground">
              {(file.size / 1024).toFixed(1)} KB
            </span>
          </div>
        </a>
      )}
    </div>
  );
}

export function MessageList() {
  const { messages, isInitialized } = useWaku();
  const { address: currentUserAddress } = useWallet();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isInitialized) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-lg font-medium mb-2">Not Connected</div>
          <div className="text-sm text-muted-foreground">
            Connect to start chatting
          </div>
        </motion.div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-lg font-medium mb-2">No Messages Yet</div>
          <div className="text-sm text-muted-foreground">
            Be the first to send a message!
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
      <AnimatePresence initial={false}>
        {messages.map((msg, index) => {
          const isCurrentUser = msg.address === currentUserAddress;
          const showTimestamp = index === 0 || 
            messages[index - 1].timestamp < msg.timestamp - 5 * 60 * 1000;

          return (
            <motion.div
              key={`${msg.timestamp}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`flex items-start gap-3 group ${
                isCurrentUser ? 'flex-row-reverse' : ''
              }`}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>

              <div className={`flex flex-col ${isCurrentUser ? 'items-end' : ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">
                    {msg.nick || truncateEthAddress(msg.address)}
                  </span>
                  {showTimestamp && (
                    <span className="text-xs text-muted-foreground">
                      {format(msg.timestamp, 'HH:mm')}
                    </span>
                  )}
                </div>

                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] break-words ${
                    isCurrentUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div>{msg.message}</div>
                  {msg.file && <FilePreview file={msg.file} />}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  );
}