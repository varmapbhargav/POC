import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Sidebar } from './Sidebar';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronLeft } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { WakuProvider } from '@/lib/waku/waku-context';
import { NicknameModal } from './NicknameModal';
import { WalletProvider } from '@/lib/wallet/wallet-context';
import { WalletConnect } from './WalletConnect';

function ChatContent() {
  const [showSidebar, setShowSidebar] = useState(true);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Close sidebar by default on mobile
  useEffect(() => {
    if (!isDesktop) {
      setShowSidebar(false);
    }
  }, [isDesktop]);

  return (
    <>
      <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Overlay for mobile sidebar */}
        <AnimatePresence>
          {showSidebar && !isDesktop && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-20"
              onClick={() => setShowSidebar(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.div
          initial={false}
          animate={{
            width: showSidebar ? (isDesktop ? "300px" : "280px") : "0px",
            x: showSidebar ? 0 : -300,
          }}
          className={`
            fixed md:relative h-full bg-gray-800/50 backdrop-blur-lg
            border-r border-white/10 overflow-hidden z-30
            transition-all duration-300 ease-in-out
          `}
        >
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Channels
            </h2>
            {!isDesktop && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSidebar(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
          <Sidebar />
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <motion.div
            layout
            className="h-16 border-b border-white/10 flex items-center px-4 gap-4 bg-gray-800/50 backdrop-blur-lg"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSidebar(!showSidebar)}
              className="hover:bg-white/10"
            >
              {showSidebar ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            
            <h1 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Waku Chat
            </h1>
            
            <div className="ml-auto">
              <WalletConnect />
            </div>
          </motion.div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col min-h-0 relative">
            <motion.div
              layout
              className="flex-1 flex flex-col min-w-0"
            >
              {/* Gradient Overlays */}
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-gray-900 to-transparent pointer-events-none z-10" />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none z-10" />

              {/* Messages */}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30 px-4">
                <MessageList />
              </div>
            </motion.div>

            {/* Message Input */}
            <div className="bg-gray-800/50 backdrop-blur-lg border-t border-white/10 p-4">
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

export default ChatLayout;