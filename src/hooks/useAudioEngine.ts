import { useState, useRef, useCallback, useEffect } from 'react';

export interface Track {
  id: string;
  name: string;
  url: string;
  file: File;
}

export interface EQBand {
  frequency: number;
  gain: number;
  label: string;
}

const DEFAULT_EQ_BANDS: EQBand[] = [
  { frequency: 32, gain: 0, label: '32' },
  { frequency: 64, gain: 0, label: '64' },
  { frequency: 125, gain: 0, label: '125' },
  { frequency: 250, gain: 0, label: '250' },
  { frequency: 500, gain: 0, label: '500' },
  { frequency: 1000, gain: 0, label: '1K' },
  { frequency: 2000, gain: 0, label: '2K' },
  { frequency: 4000, gain: 0, label: '4K' },
  { frequency: 8000, gain: 0, label: '8K' },
  { frequency: 16000, gain: 0, label: '16K' },
];

export const EQ_PRESETS: Record<string, number[]> = {
  Flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  'Bass Boost': [8, 6, 4, 2, 0, 0, 0, 0, 0, 0],
  Treble: [0, 0, 0, 0, 0, 2, 4, 6, 8, 8],
  Vocal: [-2, -1, 0, 2, 4, 4, 3, 2, 1, 0],
  Rock: [5, 4, 2, 0, -1, 0, 2, 4, 5, 5],
  EDM: [6, 5, 2, 0, -2, 0, 2, 4, 6, 5],
  Pop: [1, 2, 3, 2, 0, -1, 0, 2, 3, 2],
  Loud: [5, 4, 3, 2, 2, 2, 3, 4, 5, 5],
};

export function useAudioEngine() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [volume, setVolume] = useState(0.8);
  const [gain, setGain] = useState(0);
  const [eqBands, setEqBands] = useState<EQBand[]>(DEFAULT_EQ_BANDS);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const eqFiltersRef = useRef<BiquadFilterNode[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Initialize audio context and nodes
  const initAudioContext = useCallback(() => {
    if (audioContextRef.current) return;

    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.preload = 'auto';
    audioRef.current = audio;

    const ctx = new AudioContext();
    audioContextRef.current = ctx;

    const source = ctx.createMediaElementSource(audio);
    sourceRef.current = source;

    // Create gain node
    const gainNode = ctx.createGain();
    gainNode.gain.value = volume;
    gainNodeRef.current = gainNode;

    // Create analyser
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    // Create EQ filters
    const filters = DEFAULT_EQ_BANDS.map((band, index) => {
      const filter = ctx.createBiquadFilter();
      filter.type = index === 0 ? 'lowshelf' : index === 9 ? 'highshelf' : 'peaking';
      filter.frequency.value = band.frequency;
      filter.gain.value = band.gain;
      filter.Q.value = 1;
      return filter;
    });
    eqFiltersRef.current = filters;

    // Connect: source -> filters -> gain -> analyser -> destination
    let lastNode: AudioNode = source;
    filters.forEach(filter => {
      lastNode.connect(filter);
      lastNode = filter;
    });
    lastNode.connect(gainNode);
    gainNode.connect(analyser);
    analyser.connect(ctx.destination);

    // Audio events
    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
    });
  }, [volume]);

  // Play/Pause
  const togglePlay = useCallback(async () => {
    if (!audioRef.current || !currentTrack) return;

    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (e) {
        console.error('Playback error:', e);
      }
    }
  }, [isPlaying, currentTrack]);

  // Load and play track
  const playTrack = useCallback(async (track: Track) => {
    initAudioContext();
    
    if (!audioRef.current) return;

    audioRef.current.src = track.url;
    setCurrentTrack(track);
    setCurrentTime(0);
    
    try {
      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (e) {
      console.error('Playback error:', e);
    }
  }, [initAudioContext]);

  // Add tracks to playlist
  const addTracks = useCallback((files: File[]) => {
    const newTracks: Track[] = files.map(file => ({
      id: crypto.randomUUID(),
      name: file.name.replace(/\.[^/.]+$/, ''),
      url: URL.createObjectURL(file),
      file,
    }));
    
    setPlaylist(prev => [...prev, ...newTracks]);
    
    // Auto-play first track if nothing is playing
    if (!currentTrack && newTracks.length > 0) {
      playTrack(newTracks[0]);
    }
  }, [currentTrack, playTrack]);

  // Update volume
  useEffect(() => {
    if (gainNodeRef.current) {
      // Convert 0-1 volume to gain with dB gain adjustment
      const linearGain = volume * Math.pow(10, gain / 20);
      gainNodeRef.current.gain.value = linearGain;
    }
  }, [volume, gain]);

  // Update EQ
  const updateEQ = useCallback((index: number, value: number) => {
    setEqBands(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], gain: value };
      return updated;
    });

    if (eqFiltersRef.current[index]) {
      eqFiltersRef.current[index].gain.value = value;
    }
  }, []);

  // Apply preset
  const applyPreset = useCallback((presetName: string) => {
    const preset = EQ_PRESETS[presetName];
    if (!preset) return;

    setEqBands(prev => prev.map((band, i) => ({ ...band, gain: preset[i] })));
    
    eqFiltersRef.current.forEach((filter, i) => {
      filter.gain.value = preset[i];
    });
  }, []);

  // Seek
  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  // Get analyser for visualizers
  const getAnalyser = useCallback(() => analyserRef.current, []);

  return {
    // State
    isPlaying,
    currentTrack,
    playlist,
    volume,
    gain,
    eqBands,
    currentTime,
    duration,
    
    // Actions
    togglePlay,
    playTrack,
    addTracks,
    setVolume,
    setGain,
    updateEQ,
    applyPreset,
    seek,
    getAnalyser,
  };
}
