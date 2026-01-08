import { Play, Pause, Music, SkipBack, SkipForward, Shuffle, Repeat, Repeat1 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Track, RepeatMode } from '@/hooks/useAudioEngine';
import { cn } from '@/lib/utils';

interface PlaybackControlsProps {
  isPlaying: boolean;
  currentTrack: Track | null;
  currentTime: number;
  duration: number;
  shuffle: boolean;
  repeat: RepeatMode;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onShuffleToggle: () => void;
  onRepeatToggle: () => void;
}

export function PlaybackControls({
  isPlaying,
  currentTrack,
  currentTime,
  duration,
  shuffle,
  repeat,
  onTogglePlay,
  onSeek,
  onNext,
  onPrev,
  onShuffleToggle,
  onRepeatToggle,
}: PlaybackControlsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const RepeatIcon = repeat === 'one' ? Repeat1 : Repeat;

  return (
    <div className="rounded-xl bg-card/50 border border-border p-4 backdrop-blur-sm flex-1">
      <div className="flex items-center gap-4">
        {/* Shuffle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onShuffleToggle}
          className={cn('h-9 w-9', shuffle && 'text-primary')}
        >
          <Shuffle className="w-4 h-4" />
        </Button>

        {/* Previous */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrev}
          disabled={!currentTrack}
          className="h-9 w-9"
        >
          <SkipBack className="w-4 h-4" />
        </Button>

        {/* Play/Pause Button */}
        <Button
          variant="default"
          size="icon"
          onClick={onTogglePlay}
          disabled={!currentTrack}
          className={cn(
            'h-14 w-14 rounded-full transition-all',
            isPlaying && 'glow-primary'
          )}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-1" />
          )}
        </Button>

        {/* Next */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onNext}
          disabled={!currentTrack}
          className="h-9 w-9"
        >
          <SkipForward className="w-4 h-4" />
        </Button>

        {/* Repeat */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onRepeatToggle}
          className={cn('h-9 w-9', repeat !== 'off' && 'text-primary')}
        >
          <RepeatIcon className="w-4 h-4" />
        </Button>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Music className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="font-medium truncate">
              {currentTrack?.name || 'No track selected'}
            </span>
            {currentTrack?.artist && (
              <span className="text-sm text-muted-foreground truncate">
                — {currentTrack.artist}
              </span>
            )}
          </div>

          {/* Seek Bar */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-muted-foreground w-10">
              {formatTime(currentTime)}
            </span>
            
            <Slider
              value={[currentTime]}
              min={0}
              max={duration || 100}
              step={0.1}
              onValueChange={([t]) => onSeek(t)}
              disabled={!currentTrack}
              className="flex-1"
            />
            
            <span className="text-xs font-mono text-muted-foreground w-10 text-right">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
