import { EQ_PRESETS } from '@/hooks/useAudioEngine';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PresetsProps {
  activePreset: string | null;
  onApply: (presetName: string) => void;
}

export function Presets({ activePreset, onApply }: PresetsProps) {
  const presetNames = Object.keys(EQ_PRESETS);

  return (
    <div className="rounded-xl bg-card/50 border border-border p-4 backdrop-blur-sm">
      <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
        EQ Presets
      </h2>
      
      <div className="grid grid-cols-4 gap-2">
        {presetNames.map(name => (
          <Button
            key={name}
            variant={activePreset === name ? 'default' : 'secondary'}
            size="sm"
            onClick={() => onApply(name)}
            className={cn(
              'text-xs font-medium transition-all',
              activePreset === name && 'glow-subtle'
            )}
          >
            {name}
          </Button>
        ))}
      </div>
    </div>
  );
}
