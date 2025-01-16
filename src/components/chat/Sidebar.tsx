import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X, Plus, MessageSquarePlus } from 'lucide-react';
import { AnimatedIconButton } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface SidebarProps {
  onClose?: () => void;
}

const contacts = [
  {
    id: 1,
    name: 'Alice Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    status: 'online',
    lastMessage: 'Hey, how are you?',
    time: '2m ago',
    unread: 2,
  },
  {
    id: 2,
    name: 'Bob Smith',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100',
    status: 'online',
    lastMessage: 'The project is due tomorrow',
    time: '1h ago',
    unread: 0,
  },
  {
    id: 3,
    name: 'Carol Williams',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100',
    status: 'offline',
    lastMessage: 'The meeting is at 3 PM',
    time: 'Yesterday',
    unread: 1,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
};

export function Sidebar({ onClose }: SidebarProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedContact, setSelectedContact] = useState<number | null>(null);

  return (
    <div className="w-full sm:w-80 h-full flex flex-col bg-gray-900/50 backdrop-blur-xl">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 flex items-center justify-between border-b border-white/10"
      >
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          Messages
        </h2>
        {onClose && (
          <AnimatedIconButton
            icon={X}
            variant="ghost"
            size="sm"
            className="lg:hidden hover:bg-white/10"
            onClick={onClose}
          />
        )}
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4"
      >
        <div className="relative group">
          <Input
            placeholder="Search conversations..."
            className={cn(
              "pl-10 pr-4 h-10 bg-white/5 border-white/10",
              "focus:border-white/20 focus:ring-2 focus:ring-white/10",
              "transition-all duration-200",
              searchFocused && "bg-white/10"
            )}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <Search className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4",
            "transition-colors duration-200",
            searchFocused ? "text-white/80" : "text-white/50"
          )} />
        </div>
      </motion.div>

      {/* Contacts List */}
      <ScrollArea className="flex-1 px-2">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-2"
        >
          {contacts.map((contact) => (
            <motion.div
              key={contact.id}
              variants={itemVariants}
              className={cn(
                "group relative p-3 rounded-xl cursor-pointer",
                "hover:bg-white/10 active:bg-white/5",
                "transition-all duration-200",
                "border border-transparent",
                selectedContact === contact.id ? "bg-white/10 border-white/20" : "hover:border-white/10",
              )}
              onClick={() => setSelectedContact(contact.id)}
            >
              {/* Contact Item Content */}
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="relative">
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.img
                      src={contact.avatar}
                      alt={contact.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    />
                    {contact.status === 'online' && (
                      <motion.div
                        className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                      />
                    )}
                  </motion.div>
                </div>

                {/* Contact Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold truncate pr-2">{contact.name}</h3>
                    <span className="text-xs text-white/50">{contact.time}</span>
                  </div>
                  <p className="text-sm text-white/70 truncate mt-1">{contact.lastMessage}</p>
                </div>

                {/* Unread Badge */}
                <AnimatePresence>
                  {contact.unread > 0 && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="min-w-[1.5rem] h-6 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-2"
                    >
                      <span className="text-xs font-medium">{contact.unread}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Hover Effect */}
              <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                initial={false}
                transition={{ duration: 0.2 }}
              />
            </motion.div>
          ))}
        </motion.div>
      </ScrollArea>

      {/* Bottom Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-4 border-t border-white/10 mt-auto"
      >
        <Button
          variant="glass"
          className={cn(
            "w-full justify-start gap-2 bg-gradient-to-r",
            "from-blue-500/10 to-purple-500/10",
            "hover:from-blue-500/20 hover:to-purple-500/20",
            "border border-white/10 hover:border-white/20",
            "transition-all duration-200"
          )}
          size="lg"
        >
          <MessageSquarePlus className="w-5 h-5" />
          <span className="truncate">Start New Chat</span>
        </Button>
      </motion.div>
    </div>
  );
}

export default Sidebar;