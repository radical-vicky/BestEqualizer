import { Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface VolumeControlsProps {
  volume: number;
  gain: number;
  onVolumeChange: (value: number) => void;
  onGainChange: (value: number) => void;
}

export function VolumeControls({
  volume,
  gain,
  onVolumeChange,
  onGainChange,
}: VolumeControlsProps) {
  const isMuted = volume === 0;

  return (
    <div className="rounded-xl bg-card/50 border border-border p-6 backdrop-blur-sm">
      <h2 className="text-sm font-medium text-muted-foreground mb-6 uppercase tracking-wider">
        Master Controls
      </h2>

      <div className="space-y-8">
        {/* Volume */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Volume2 className="w-5 h-5 text-primary" />
              )}
              <span className="text-sm font-medium">Volume</span>
            </div>
            <span className="text-sm font-mono tabular-nums text-muted-foreground">
              {Math.round(volume * 100)}%
            </span>
          </div>
          
          <Slider
            value={[volume]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={([v]) => onVolumeChange(v)}
            className="w-full"
          />
        </div>

        {/* Gain */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Gain</span>
            <span className={cn(
              'text-sm font-mono tabular-nums',
              gain > 0 ? 'text-primary' : gain < 0 ? 'text-destructive' : 'text-muted-foreground'
            )}>
              {gain > 0 ? '+' : ''}{gain.toFixed(1)} dB
            </span>
          </div>
          
          <Slider
            value={[gain]}
            min={-12}
            max={12}
            step={0.5}
            onValueChange={([g]) => onGainChange(g)}
            className="w-full"
          />
        </div>

        {/* VU Meter visualization */}
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Level</span>
          <div className="flex gap-1 h-3">
            {Array.from({ length: 20 }).map((_, i) => {
              const threshold = i / 20;
              const isActive = volume > threshold;
              const color = i < 14 ? 'bg-green-500' : i < 17 ? 'bg-yellow-500' : 'bg-red-500';
              return (
                <div
                  key={i}
                  className={cn(
                    'flex-1 rounded-sm transition-all duration-75',
                    isActive ? color : 'bg-muted/30'
                  )}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
