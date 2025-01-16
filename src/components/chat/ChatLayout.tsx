import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Sidebar } from './Sidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { WakuProvider } from '@/lib/waku/waku-context';
import { NicknameModal } from './NicknameModal';
import { WalletProvider } from '@/lib/wallet/wallet-context';
import { WalletConnect } from './WalletConnect';

function ChatContent() {
  const [showSidebar, setShowSidebar] = useState(true);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <>
      <div className="flex h-screen bg-gradient-to-b from-background to-background/95">
        {/* Sidebar */}
        <motion.div
          initial={false}
          animate={{
            width: showSidebar ? "300px" : "0px",
            opacity: showSidebar ? 1 : 0,
          }}
          className="h-full border-r border-white/10 overflow-hidden"
        >
          <Sidebar />
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="h-16 border-b border-white/10 flex items-center px-4 gap-4 bg-white/5 backdrop-blur-sm">
            {!isDesktop && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-xl font-semibold text-gradient">Waku Chat</h1>
            <div className="ml-auto">
              <WalletConnect />
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col min-h-0">
            <motion.div
              layout
              className="flex-1 flex flex-col min-w-0 relative"
            >
              {/* Gradient Overlays */}
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent pointer-events-none z-10" />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />

              {/* Messages */}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
                <MessageList />
              </div>
            </motion.div>

            {/* Message Input */}
            <div className="bg-white/5 backdrop-blur-sm border-t border-white/10">
              <MessageInput />
            </div>
          </div>
        </div>
      </div>

      <NicknameModal
        isOpen={showNicknameModal}
        onClose={() => setShowNicknameModal(false)}
      />
    </>
  );
}

export function ChatLayout() {
  return (
    <WalletProvider>
      <WakuProvider>
        <ChatContent />
      </WakuProvider>
    </WalletProvider>
  );
}