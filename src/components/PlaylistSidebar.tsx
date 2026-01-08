import { useState } from 'react';
import { Music, GripVertical, X, List } from 'lucide-react';
import { Track } from '@/hooks/useAudioEngine';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface PlaylistSidebarProps {
  playlist: Track[];
  currentTrack: Track | null;
  onSelectTrack: (track: Track) => void;
  onRemoveTrack: (trackId: string) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
}

export function PlaylistSidebar({
  playlist,
  currentTrack,
  onSelectTrack,
  onRemoveTrack,
  onReorder,
}: PlaylistSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      onReorder(draggedIndex, dragOverIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50 lg:hidden h-12 w-12 rounded-full glow-primary"
        onClick={() => setIsOpen(!isOpen)}
      >
        <List className="w-5 h-5" />
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed right-0 top-0 h-full w-72 bg-sidebar-background border-l border-sidebar-border z-40',
          'transform transition-transform duration-300 ease-in-out',
          'lg:relative lg:transform-none',
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <h2 className="font-semibold flex items-center gap-2">
            <Music className="w-4 h-4 text-primary" />
            Playlist
          </h2>
          <span className="text-xs text-muted-foreground">{playlist.length} tracks</span>
        </div>

        <ScrollArea className="h-[calc(100%-60px)]">
          <div className="p-2">
            {playlist.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 text-sm">
                No tracks yet. Upload some music!
              </div>
            ) : (
              <ul className="space-y-1">
                {playlist.map((track, index) => (
                  <li
                    key={track.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      'group flex items-center gap-2 p-2 rounded-lg cursor-pointer',
                      'transition-all duration-150',
                      'hover:bg-sidebar-accent',
                      currentTrack?.id === track.id && 'bg-sidebar-accent border-l-2 border-primary',
                      dragOverIndex === index && 'border-t-2 border-primary'
                    )}
                    onClick={() => onSelectTrack(track)}
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab" />
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{track.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {track.artist || 'Unknown Artist'}
                      </p>
                    </div>

                    <span className="text-xs text-muted-foreground">
                      {formatDuration(track.duration)}
                    </span>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveTrack(track.id);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
