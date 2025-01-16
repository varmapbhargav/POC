import { Button } from '@/components/ui/button';
import { useWaku } from '@/lib/waku/waku-context';
import { Paperclip, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export function FileUpload({ onFileSelect, selectedFile }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isInitialized } = useWaku();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File size exceeds 10MB limit');
      return;
    }

    onFileSelect(file);
  };

  return (
    <div className="relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        disabled={!isInitialized}
      />
      
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        disabled={!isInitialized}
        className={selectedFile ? 'text-primary' : ''}
      >
        <Paperclip className="h-5 w-5" />
      </Button>

      {selectedFile && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onFileSelect(null)}
          className="absolute -right-2 -top-2 h-4 w-4 rounded-full bg-background border shadow-sm p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}