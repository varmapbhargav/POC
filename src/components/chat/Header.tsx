import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  Video,
  MoreVertical,
  UserCircle,
  Bell,
  BellOff,
  Search,
  Flag,
  Ban,
  Trash2,
  Star,
  Archive,
  VolumeX,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface HeaderProps {
  user: {
    name: string;
    avatar: string;
    status: string;
  };
  children?: React.ReactNode;
}

export function Header({ user, children }: HeaderProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="relative p-4 border-b border-white/10 bg-gray-900/50 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between gap-4">
        {/* User Info */}
        <motion.div 
          className="flex items-center space-x-4"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Avatar className="h-12 w-12 ring-2 ring-white/10 transition-all duration-200 hover:ring-white/20">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500">
              {user.name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {user.name}
            </h2>
            <motion.p 
              className="text-sm text-white/70 flex items-center gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className={cn(
                "w-2 h-2 rounded-full",
                user.status === "online" ? "bg-green-500" : "bg-gray-500"
              )} />
              {user.status}
            </motion.p>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "200px", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="relative"
              >
                <input
                  type="text"
                  placeholder="Search in chat..."
                  className={cn(
                    "w-full h-10 px-4 pr-10 rounded-lg",
                    "bg-white/5 border border-white/10",
                    "focus:border-white/20 focus:ring-1 focus:ring-white/20",
                    "placeholder:text-white/50",
                    "transition-all duration-200"
                  )}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-8 w-8 hover:bg-white/10"
                  onClick={() => setShowSearch(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div className="flex items-center gap-2" layout>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "bg-white/5 border border-white/10",
                "hover:bg-white/10 hover:border-white/20",
                "transition-all duration-200"
              )}
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="h-5 w-5" />
            </Button>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "bg-white/5 border border-white/10",
                  "hover:bg-white/10 hover:border-white/20",
                  "transition-all duration-200"
                )}
              >
                <Phone className="h-5 w-5" />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "bg-white/5 border border-white/10",
                  "hover:bg-white/10 hover:border-white/20",
                  "transition-all duration-200"
                )}
              >
                <Video className="h-5 w-5" />
              </Button>
            </motion.div>

            {children}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "bg-white/5 border border-white/10",
                    "hover:bg-white/10 hover:border-white/20",
                    "transition-all duration-200"
                  )}
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-gray-900/95 backdrop-blur-xl border border-white/10"
              >
                <DropdownMenuItem className="hover:bg-white/10 focus:bg-white/10">
                  <UserCircle className="h-4 w-4 mr-2" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-white/10 focus:bg-white/10">
                  <Star className="h-4 w-4 mr-2 text-yellow-500" />
                  Add to Favorites
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-white/10 focus:bg-white/10">
                  <Archive className="h-4 w-4 mr-2 text-purple-500" />
                  Archive Chat
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem 
                  className="hover:bg-white/10 focus:bg-white/10"
                  onClick={() => setIsNotificationsEnabled(!isNotificationsEnabled)}
                >
                  {isNotificationsEnabled ? (
                    <>
                      <BellOff className="h-4 w-4 mr-2 text-blue-500" />
                      Mute Notifications
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4 mr-2 text-green-500" />
                      Enable Notifications
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-white/10 focus:bg-white/10">
                  <VolumeX className="h-4 w-4 mr-2 text-orange-500" />
                  Mute Chat
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem className="text-yellow-500 hover:bg-white/10 focus:bg-white/10">
                  <Flag className="h-4 w-4 mr-2" />
                  Report User
                </DropdownMenuItem>
                <DropdownMenuItem className="text-orange-500 hover:bg-white/10 focus:bg-white/10">
                  <Ban className="h-4 w-4 mr-2" />
                  Block User
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-500 hover:bg-white/10 focus:bg-white/10">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default Header;