import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWaku } from '@/lib/waku/waku-context';
import { useWallet } from '@/lib/wallet/wallet-context';
import { format } from 'date-fns';
import { User, FileIcon, Image as ImageIcon, Film, Music, FileText } from 'lucide-react';
import { truncateEthAddress } from '@/lib/utils';
import { FileData } from '@/lib/waku/waku-service';

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

  const getFilePreview = () => {
    const base64Data = `data:${file.type};base64,${file.data}`;

    if (isImage) {
      return (
        <img
          src={base64Data}
          alt={file.name}
          className="max-w-[300px] max-h-[200px] rounded-lg object-cover"
        />
      );
    }

    if (isVideo) {
      return (
        <video
          src={base64Data}
          controls
          className="max-w-[300px] max-h-[200px] rounded-lg"
        />
      );
    }

    if (isAudio) {
      return (
        <audio
          src={base64Data}
          controls
          className="max-w-[300px]"
        />
      );
    }

    return (
      <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
        {getFileIcon()}
        <div className="flex flex-col">
          <span className="text-sm truncate max-w-[200px]">{file.name}</span>
          <span className="text-xs text-muted-foreground">
            {(file.size / 1024).toFixed(1)} KB
          </span>
        </div>
      </div>
    );
  };

  return (
    <a
      href={`data:${file.type};base64,${file.data}`}
      download={file.name}
      className="block mt-2"
    >
      {getFilePreview()}
    </a>
  );
}

export function MessageList() {
  const { messages, isInitialized } = useWaku();
  const { address: currentUserAddress } = useWallet();
  const bottomRef = useRef<HTMLDivElement>(null);

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
    <div className="flex-1 p-4 space-y-4">
      <AnimatePresence initial={false}>
        {messages.map((msg, index) => {
          const isCurrentUser = msg.address === currentUserAddress;
          
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
              <div className={`w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors ${
                isCurrentUser ? 'bg-primary/20' : ''
              }`}>
                <User className="w-4 h-4" />
              </div>
              <div className={`flex-1 min-w-0 ${
                isCurrentUser ? 'items-end text-right' : ''
              }`}>
                <div className={`flex items-center gap-2 ${
                  isCurrentUser ? 'justify-end' : ''
                }`}>
                  <span className="text-xs text-muted-foreground">
                    {truncateEthAddress(msg.address)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(msg.timestamp, 'HH:mm')}
                  </span>
                </div>
                <div className={`mt-1 text-sm break-words ${
                  isCurrentUser ? 'bg-primary/10' : 'bg-white/5'
                } p-3 rounded-lg inline-block max-w-[80%]`}>
                  {msg.message}
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