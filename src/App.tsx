import { ThemeProvider } from '@/components/theme/theme-provider';
import { ChatLayout } from '@/components/chat/ChatLayout';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="chat-theme">
      <div className="min-h-screen bg-background font-sans antialiased">
        <ChatLayout />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;