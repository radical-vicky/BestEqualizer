import { useState, useRef, useCallback, useEffect } from 'react';

export interface Track {
  id: string;
  name: string;
  url: string;
  file: File;
  artist?: string;
  album?: string;
  duration?: number;
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

export type RepeatMode = 'off' | 'one' | 'all';

export function useAudioEngine() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [volume, setVolume] = useState(0.8);
  const [gain, setGain] = useState(0);
  const [eqBands, setEqBands] = useState<EQBand[]>(DEFAULT_EQ_BANDS);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>('off');
  const [reverb, setReverb] = useState(0);
  const [delay, setDelay] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const eqFiltersRef = useRef<BiquadFilterNode[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const delayNodeRef = useRef<DelayNode | null>(null);
  const delayGainRef = useRef<GainNode | null>(null);
  const convolverRef = useRef<ConvolverNode | null>(null);
  const reverbGainRef = useRef<GainNode | null>(null);
  const dryGainRef = useRef<GainNode | null>(null);

  // Create impulse response for reverb
  const createImpulseResponse = useCallback((ctx: AudioContext) => {
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * 2;
    const impulse = ctx.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
      }
    }
    return impulse;
  }, []);

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

    // Create delay effect
    const delayNode = ctx.createDelay(1);
    delayNode.delayTime.value = 0.3;
    delayNodeRef.current = delayNode;

    const delayGain = ctx.createGain();
    delayGain.gain.value = 0;
    delayGainRef.current = delayGain;

    // Create reverb effect
    const convolver = ctx.createConvolver();
    convolver.buffer = createImpulseResponse(ctx);
    convolverRef.current = convolver;

    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0;
    reverbGainRef.current = reverbGain;

    const dryGain = ctx.createGain();
    dryGain.gain.value = 1;
    dryGainRef.current = dryGain;

    // Connect: source -> filters -> gain -> effects -> analyser -> destination
    let lastNode: AudioNode = source;
    filters.forEach(filter => {
      lastNode.connect(filter);
      lastNode = filter;
    });
    lastNode.connect(gainNode);

    // Dry path
    gainNode.connect(dryGain);
    dryGain.connect(analyser);

    // Delay path
    gainNode.connect(delayNode);
    delayNode.connect(delayGain);
    delayGain.connect(analyser);

    // Reverb path
    gainNode.connect(convolver);
    convolver.connect(reverbGain);
    reverbGain.connect(analyser);

    analyser.connect(ctx.destination);
  }, [volume, createImpulseResponse]);

  // Handle track end
  const handleTrackEnd = useCallback(() => {
    if (repeat === 'one' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }

    const currentIndex = playlist.findIndex(t => t.id === currentTrack?.id);
    if (currentIndex === -1) {
      setIsPlaying(false);
      return;
    }

    let nextIndex: number;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = currentIndex + 1;
    }

    if (nextIndex >= playlist.length) {
      if (repeat === 'all') {
        nextIndex = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }

    const nextTrack = playlist[nextIndex];
    if (nextTrack && audioRef.current) {
      audioRef.current.src = nextTrack.url;
      setCurrentTrack(nextTrack);
      setCurrentTime(0);
      audioRef.current.play().catch(console.error);
    }
  }, [playlist, currentTrack, shuffle, repeat]);

  // Setup audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => handleTrackEnd();
    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
  }, [handleTrackEnd]);

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

  // Next track
  const nextTrack = useCallback(() => {
    if (playlist.length === 0) return;
    const currentIndex = playlist.findIndex(t => t.id === currentTrack?.id);
    let nextIndex = shuffle 
      ? Math.floor(Math.random() * playlist.length) 
      : (currentIndex + 1) % playlist.length;
    playTrack(playlist[nextIndex]);
  }, [playlist, currentTrack, shuffle, playTrack]);

  // Previous track
  const prevTrack = useCallback(() => {
    if (playlist.length === 0) return;
    const currentIndex = playlist.findIndex(t => t.id === currentTrack?.id);
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) prevIndex = playlist.length - 1;
    playTrack(playlist[prevIndex]);
  }, [playlist, currentTrack, playTrack]);

  // Add tracks to playlist
  const addTracks = useCallback((files: File[]) => {
    const newTracks: Track[] = files.map(file => ({
      id: crypto.randomUUID(),
      name: file.name.replace(/\.[^/.]+$/, ''),
      url: URL.createObjectURL(file),
      file,
    }));
    
    setPlaylist(prev => [...prev, ...newTracks]);
    
    if (!currentTrack && newTracks.length > 0) {
      playTrack(newTracks[0]);
    }
  }, [currentTrack, playTrack]);

  // Remove track
  const removeTrack = useCallback((trackId: string) => {
    setPlaylist(prev => prev.filter(t => t.id !== trackId));
  }, []);

  // Reorder playlist
  const reorderPlaylist = useCallback((startIndex: number, endIndex: number) => {
    setPlaylist(prev => {
      const result = [...prev];
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  // Update volume
  useEffect(() => {
    if (gainNodeRef.current) {
      const linearGain = volume * Math.pow(10, gain / 20);
      gainNodeRef.current.gain.value = linearGain;
    }
  }, [volume, gain]);

  // Update delay effect
  useEffect(() => {
    if (delayGainRef.current) {
      delayGainRef.current.gain.value = delay;
    }
  }, [delay]);

  // Update reverb effect
  useEffect(() => {
    if (reverbGainRef.current && dryGainRef.current) {
      reverbGainRef.current.gain.value = reverb;
      dryGainRef.current.gain.value = 1 - reverb * 0.3;
    }
  }, [reverb]);

  // Time update
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, []);

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
    shuffle,
    repeat,
    reverb,
    delay,
    
    // Actions
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
  };
}
