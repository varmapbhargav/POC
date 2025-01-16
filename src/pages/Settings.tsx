import { motion } from 'framer-motion';
import { Bell, Lock, User, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Settings() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto p-6 space-y-8"
    >
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" />
            <AvatarFallback>AJ</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">Alice Johnson</h2>
            <p className="text-sm text-muted-foreground">alice@example.com</p>
            <Button variant="outline" size="sm" className="mt-2">
              Change Avatar
            </Button>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Bell className="w-5 h-5" />
              <div>
                <Label>Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications when you get new messages
                </p>
              </div>
            </div>
            <Switch />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Moon className="w-5 h-5" />
              <div>
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark mode
                </p>
              </div>
            </div>
            <Switch />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Lock className="w-5 h-5" />
              <div>
                <Label>Privacy</Label>
                <p className="text-sm text-muted-foreground">
                  Control who can see your online status
                </p>
              </div>
            </div>
            <Switch />
          </div>
        </div>

        <Separator />

        <div className="pt-4">
          <Button variant="destructive">Sign Out</Button>
        </div>
      </div>
    </motion.div>
  );
}