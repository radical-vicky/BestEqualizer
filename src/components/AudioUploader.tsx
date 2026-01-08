import { useRef } from 'react';
import { Upload, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioUploaderProps {
  onFilesSelected: (files: File[]) => void;
}

export function AudioUploader({ onFilesSelected }: AudioUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const audioFiles = Array.from(files).filter(file =>
      file.type.startsWith('audio/') || 
      /\.(mp3|wav|ogg|flac|m4a|aac)$/i.test(file.name)
    );

    if (audioFiles.length > 0) {
      onFilesSelected(audioFiles);
    }

    // Reset input
    e.target.value = '';
  };

  return (
    <div className="flex gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={folderInputRef}
        type="file"
        accept="audio/*"
        multiple
        // @ts-ignore - webkitdirectory is not in types
        webkitdirectory=""
        onChange={handleFileChange}
        className="hidden"
      />

      <Button
        variant="secondary"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        className="gap-2"
      >
        <Upload className="w-4 h-4" />
        Add Files
      </Button>

      <Button
        variant="secondary"
        size="sm"
        onClick={() => folderInputRef.current?.click()}
        className="gap-2"
      >
        <FolderOpen className="w-4 h-4" />
        Add Folder
      </Button>
    </div>
  );
}
