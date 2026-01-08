import { Waves, Clock } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface AudioEffectsProps {
  reverb: number;
  delay: number;
  onReverbChange: (value: number) => void;
  onDelayChange: (value: number) => void;
}

export function AudioEffects({
  reverb,
  delay,
  onReverbChange,
  onDelayChange,
}: AudioEffectsProps) {
  return (
    <div className="rounded-xl bg-card/50 border border-border p-4 backdrop-blur-sm">
      <h3 className="text-sm font-medium mb-4 text-muted-foreground">Audio Effects</h3>
      
      <div className="space-y-4">
        {/* Reverb */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Waves className="w-4 h-4 text-primary" />
              <span className="text-sm">Reverb</span>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {Math.round(reverb * 100)}%
            </span>
          </div>
          <Slider
            value={[reverb]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={([v]) => onReverbChange(v)}
          />
        </div>

        {/* Delay */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm">Delay</span>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {Math.round(delay * 100)}%
            </span>
          </div>
          <Slider
            value={[delay]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={([v]) => onDelayChange(v)}
          />
        </div>
      </div>
    </div>
  );
}
