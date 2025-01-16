import { ThemeProvider } from '@/components/theme/theme-provider';
import { ChatLayout } from '@/components/chat/ChatLayout';
import { Toaster } from '@/components/ui/toaster';
import { WakuProvider } from '@/lib/waku/waku-context';

function App() {
  return (
    <WakuProvider>
      <ThemeProvider defaultTheme="system" storageKey="chat-theme">
        <div className="min-h-screen bg-background font-sans antialiased">
          <ChatLayout />
          <Toaster />
        </div>
      </ThemeProvider>
    </WakuProvider>
  );
}

export default App;