import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  role: 'admin' | 'member';
  status: 'online' | 'offline';
}

const groupMembers: GroupMember[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    role: 'admin',
    status: 'online',
  },
  {
    id: '2',
    name: 'Bob Smith',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100',
    role: 'member',
    status: 'offline',
  },
];

export function GroupChat() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4"
    >
      <div className="space-y-4">
        <div className="text-center">
          <Avatar className="w-20 h-20 mx-auto">
            <AvatarImage src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200" />
            <AvatarFallback>Team</AvatarFallback>
          </Avatar>
          <h2 className="mt-2 text-xl font-semibold">Project Team</h2>
          <p className="text-sm text-muted-foreground">Created by Alice Johnson</p>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-3">Members ({groupMembers.length})</h3>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {groupMembers.map((member) => (
                <motion.div
                  key={member.id}
                  whileHover={{ x: 5 }}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-accent"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name[0]}</AvatarFallback>
                      </Avatar>
                      <span 
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background
                          ${member.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}
                      />
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.status}</p>
                    </div>
                  </div>
                  {member.role === 'admin' && (
                    <Badge variant="secondary">Admin</Badge>
                  )}
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </motion.div>
  );
}