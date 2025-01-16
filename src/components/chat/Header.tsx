import { motion } from 'framer-motion';
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

interface HeaderProps {
  user: {
    name: string;
    avatar: string;
    status: string;
  };
  children?: React.ReactNode;
}

export function Header({ user, children }: HeaderProps) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="p-4 border-b border-white/10 backdrop-blur-sm bg-white/10 dark:bg-black/10"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold bg-gradient-to-r from-primary-gradient-start to-primary-gradient-end bg-clip-text text-transparent">
              {user.name}
            </h2>
            <p className="text-sm text-white/70">{user.status}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="glass" size="icon">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="glass" size="icon">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="glass" size="icon">
            <Video className="h-5 w-5" />
          </Button>
          {children}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="glass" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white/80 dark:bg-black/80 backdrop-blur-md">
              <DropdownMenuItem className="hover:bg-white/20 dark:hover:bg-black/20">
                <UserCircle className="h-4 w-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-white/20 dark:hover:bg-black/20">
                <Star className="h-4 w-4 mr-2" />
                Add to Favorites
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-white/20 dark:hover:bg-black/20">
                <Archive className="h-4 w-4 mr-2" />
                Archive Chat
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="hover:bg-white/20 dark:hover:bg-black/20">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-white/20 dark:hover:bg-black/20">
                <VolumeX className="h-4 w-4 mr-2" />
                Mute Chat
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-yellow-600 dark:text-yellow-500 hover:bg-white/20 dark:hover:bg-black/20">
                <Flag className="h-4 w-4 mr-2" />
                Report User
              </DropdownMenuItem>
              <DropdownMenuItem className="text-orange-600 dark:text-orange-500 hover:bg-white/20 dark:hover:bg-black/20">
                <Ban className="h-4 w-4 mr-2" />
                Block User
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive hover:bg-white/20 dark:hover:bg-black/20">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
}