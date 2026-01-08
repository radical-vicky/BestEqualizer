import { EQBand } from '@/hooks/useAudioEngine';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface EqualizerProps {
  bands: EQBand[];
  onBandChange: (index: number, value: number) => void;
}

export function Equalizer({ bands, onBandChange }: EqualizerProps) {
  return (
    <div className="rounded-xl bg-card/50 border border-border p-6 backdrop-blur-sm">
      <h2 className="text-sm font-medium text-muted-foreground mb-6 uppercase tracking-wider">
        10-Band Equalizer
      </h2>
      
      <div className="flex items-end justify-between gap-2 h-64">
        {bands.map((band, index) => (
          <EQSlider
            key={band.frequency}
            band={band}
            index={index}
            onChange={onBandChange}
          />
        ))}
      </div>
      
      {/* dB scale */}
      <div className="flex justify-between mt-4 text-xs text-muted-foreground">
        <span>+12dB</span>
        <span>0dB</span>
        <span>-12dB</span>
      </div>
    </div>
  );
}

interface EQSliderProps {
  band: EQBand;
  index: number;
  onChange: (index: number, value: number) => void;
}

function EQSlider({ band, index, onChange }: EQSliderProps) {
  // Color based on frequency range
  const getColor = () => {
    if (index < 3) return 'bg-red-500'; // Low
    if (index < 7) return 'bg-yellow-500'; // Mid
    return 'bg-green-500'; // High
  };

  // LED meter visualization
  const ledCount = 10;
  const normalizedGain = (band.gain + 12) / 24; // 0 to 1
  const activeLeds = Math.round(normalizedGain * ledCount);

  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      {/* LED Meter */}
      <div className="flex flex-col-reverse gap-0.5 mb-2">
        {Array.from({ length: ledCount }).map((_, i) => {
          const isActive = i < activeLeds;
          const ledColor = i < 3 ? 'bg-green-500' : i < 7 ? 'bg-yellow-500' : 'bg-red-500';
          return (
            <div
              key={i}
              className={cn(
                'w-4 h-1.5 rounded-sm transition-all duration-75',
                isActive ? ledColor : 'bg-muted/30'
              )}
            />
          );
        })}
      </div>

      {/* Vertical Slider */}
      <div className="h-40 flex items-center">
        <Slider
          orientation="vertical"
          value={[band.gain]}
          min={-12}
          max={12}
          step={0.5}
          onValueChange={([value]) => onChange(index, value)}
          className="h-full"
        />
      </div>

      {/* Frequency label */}
      <span className="text-xs text-muted-foreground font-mono">
        {band.label}
      </span>
      
      {/* Gain value */}
      <span className={cn(
        'text-xs font-mono tabular-nums',
        band.gain > 0 ? 'text-primary' : band.gain < 0 ? 'text-destructive' : 'text-muted-foreground'
      )}>
        {band.gain > 0 ? '+' : ''}{band.gain.toFixed(1)}
      </span>
    </div>
  );
}
