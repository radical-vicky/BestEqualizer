import { useState, useEffect } from 'react';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { Header } from '@/components/Header';
import { Equalizer } from '@/components/Equalizer';
import { VolumeControls } from '@/components/VolumeControls';
import { Presets } from '@/components/Presets';
import { AudioUploader } from '@/components/AudioUploader';
import { PlaybackControls } from '@/components/PlaybackControls';

type Theme = 'dark' | 'light';
type ColorScheme = 'cyan' | 'purple' | 'green';

const Index = () => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [colorScheme, setColorScheme] = useState<ColorScheme>('cyan');
  const [activePreset, setActivePreset] = useState<string | null>('Flat');

  const {
    isPlaying,
    currentTrack,
    volume,
    gain,
    eqBands,
    currentTime,
    duration,
    togglePlay,
    addTracks,
    setVolume,
    setGain,
    updateEQ,
    applyPreset,
    seek,
  } = useAudioEngine();

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Apply color scheme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', colorScheme);
  }, [colorScheme]);

  const handleApplyPreset = (presetName: string) => {
    applyPreset(presetName);
    setActivePreset(presetName);
  };

  const handleEQChange = (index: number, value: number) => {
    updateEQ(index, value);
    setActivePreset(null); // Clear preset when manually adjusting
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        theme={theme}
        colorScheme={colorScheme}
        onThemeChange={setTheme}
        onColorSchemeChange={setColorScheme}
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Playback & Upload Row */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <PlaybackControls
            isPlaying={isPlaying}
            currentTrack={currentTrack}
            currentTime={currentTime}
            duration={duration}
            onTogglePlay={togglePlay}
            onSeek={seek}
          />
          <AudioUploader onFilesSelected={addTracks} />
        </div>

        {/* Presets */}
        <Presets activePreset={activePreset} onApply={handleApplyPreset} />

        {/* EQ & Volume Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Equalizer bands={eqBands} onBandChange={handleEQChange} />
          </div>
          <div>
            <VolumeControls
              volume={volume}
              gain={gain}
              onVolumeChange={setVolume}
              onGainChange={setGain}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
