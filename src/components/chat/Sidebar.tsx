import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X } from 'lucide-react';
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
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
};

export function Sidebar({ onClose }: SidebarProps) {
  return (
    <div className="w-full sm:w-80 h-full flex flex-col bg-white/5 backdrop-blur-md">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-bold text-gradient"
        >
          Messages
        </motion.h2>
        {onClose && (
          <AnimatedIconButton
            icon={X}
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onClose}
          />
        )}
      </div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-4 pb-4"
      >
        <div className="relative">
          <Input
            placeholder="Search conversations..."
            className="pl-10 pr-4 h-10 bg-white/5 border-white/10 focus:border-white/20"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
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
                "border border-transparent hover:border-white/10"
              )}
            >
              {/* Contact Item Content */}
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="relative">
                  <motion.img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-12 h-12 rounded-full object-cover"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  />
                  {contact.status === 'online' && (
                    <motion.div
                      className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                    />
                  )}
                </div>

                {/* Contact Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold truncate pr-2">{contact.name}</h3>
                    <span className="text-xs text-white/50">{contact.time}</span>
                  </div>
                  <p className="text-sm text-white/70 truncate">{contact.lastMessage}</p>
                </div>

                {/* Unread Badge */}
                {contact.unread > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="min-w-[1.5rem] h-6 flex items-center justify-center rounded-full bg-gradient-to-r from-primary-gradient-start to-primary-gradient-end px-2"
                  >
                    <span className="text-xs font-medium">{contact.unread}</span>
                  </motion.div>
                )}
              </div>

              {/* Hover Effect */}
              <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-gradient-start/20 to-primary-gradient-end/20 opacity-0 group-hover:opacity-100 transition-opacity"
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
          className="w-full justify-start gap-2"
          size="lg"
        >
          <span className="truncate">Start New Chat</span>
        </Button>
      </motion.div>
    </div>
  );
}