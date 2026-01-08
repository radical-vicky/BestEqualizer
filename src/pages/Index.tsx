import { useState, useEffect } from 'react';
import { useAudioEngine, RepeatMode } from '@/hooks/useAudioEngine';
import { Header } from '@/components/Header';
import { Equalizer } from '@/components/Equalizer';
import { VolumeControls } from '@/components/VolumeControls';
import { Presets } from '@/components/Presets';
import { AudioUploader } from '@/components/AudioUploader';
import { PlaybackControls } from '@/components/PlaybackControls';
import { PlaylistSidebar } from '@/components/PlaylistSidebar';
import { SpectrumAnalyzer } from '@/components/SpectrumAnalyzer';
import { AudioEffects } from '@/components/AudioEffects';

type Theme = 'dark' | 'light';
type ColorScheme = 'cyan' | 'purple' | 'green';

const Index = () => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [colorScheme, setColorScheme] = useState<ColorScheme>('cyan');
  const [activePreset, setActivePreset] = useState<string | null>('Flat');

  const {
    isPlaying,
    currentTrack,
    playlist,
    volume,
    gain,
    eqBands,
    currentTime,
    duration,
    shuffle,
    repeat,
    reverb,
    delay,
    togglePlay,
    playTrack,
    nextTrack,
    prevTrack,
    addTracks,
    removeTrack,
    reorderPlaylist,
    setVolume,
    setGain,
    updateEQ,
    applyPreset,
    seek,
    getAnalyser,
    setShuffle,
    setRepeat,
    setReverb,
    setDelay,
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
    setActivePreset(null);
  };

  const handleRepeatToggle = () => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeat);
    setRepeat(modes[(currentIndex + 1) % modes.length]);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 flex flex-col">
        <Header
          theme={theme}
          colorScheme={colorScheme}
          onThemeChange={setTheme}
          onColorSchemeChange={setColorScheme}
        />

        <main className="container mx-auto px-4 py-6 space-y-6 flex-1">
          {/* Playback & Upload Row */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch">
            <PlaybackControls
              isPlaying={isPlaying}
              currentTrack={currentTrack}
              currentTime={currentTime}
              duration={duration}
              shuffle={shuffle}
              repeat={repeat}
              onTogglePlay={togglePlay}
              onSeek={seek}
              onNext={nextTrack}
              onPrev={prevTrack}
              onShuffleToggle={() => setShuffle(!shuffle)}
              onRepeatToggle={handleRepeatToggle}
            />
            <AudioUploader onFilesSelected={addTracks} />
          </div>

          {/* Spectrum Analyzer */}
          <SpectrumAnalyzer getAnalyser={getAnalyser} isPlaying={isPlaying} />

          {/* Presets */}
          <Presets activePreset={activePreset} onApply={handleApplyPreset} />

          {/* EQ, Volume & Effects Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Equalizer bands={eqBands} onBandChange={handleEQChange} />
            </div>
            <div className="space-y-4">
              <VolumeControls
                volume={volume}
                gain={gain}
                onVolumeChange={setVolume}
                onGainChange={setGain}
              />
              <AudioEffects
                reverb={reverb}
                delay={delay}
                onReverbChange={setReverb}
                onDelayChange={setDelay}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Playlist Sidebar */}
      <PlaylistSidebar
        playlist={playlist}
        currentTrack={currentTrack}
        onSelectTrack={playTrack}
        onRemoveTrack={removeTrack}
        onReorder={reorderPlaylist}
      />
    </div>
  );
};

export default Index;
