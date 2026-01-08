import { useEffect, useRef } from 'react';

interface SpectrumAnalyzerProps {
  getAnalyser: () => AnalyserNode | null;
  isPlaying: boolean;
}

export function SpectrumAnalyzer({ getAnalyser, isPlaying }: SpectrumAnalyzerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const draw = () => {
      const analyser = getAnalyser();
      const rect = canvas.getBoundingClientRect();
      
      ctx.clearRect(0, 0, rect.width, rect.height);

      if (!analyser || !isPlaying) {
        // Draw idle state
        const barCount = 32;
        const barWidth = rect.width / barCount - 2;
        
        for (let i = 0; i < barCount; i++) {
          const height = Math.random() * 5 + 2;
          const x = i * (barWidth + 2);
          
          ctx.fillStyle = `hsla(var(--primary), 0.3)`;
          ctx.fillRect(x, rect.height - height, barWidth, height);
        }
        
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      const barCount = 32;
      const barWidth = rect.width / barCount - 2;

      // Get computed CSS variable
      const computedStyle = getComputedStyle(document.documentElement);
      const neonHue = computedStyle.getPropertyValue('--neon-hue').trim() || '190';

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor(i * bufferLength / barCount);
        const value = dataArray[dataIndex];
        const height = (value / 255) * rect.height * 0.9;
        const x = i * (barWidth + 2);

        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(x, rect.height, x, rect.height - height);
        gradient.addColorStop(0, `hsl(${neonHue}, 100%, 50%)`);
        gradient.addColorStop(0.5, `hsl(${neonHue}, 100%, 60%)`);
        gradient.addColorStop(1, `hsl(${neonHue}, 100%, 70%)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(x, rect.height - height, barWidth, height);

        // Glow effect
        ctx.shadowColor = `hsl(${neonHue}, 100%, 50%)`;
        ctx.shadowBlur = 10;
        ctx.fillRect(x, rect.height - height, barWidth, height);
        ctx.shadowBlur = 0;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [getAnalyser, isPlaying]);

  return (
    <div className="rounded-xl bg-card/50 border border-border p-4 backdrop-blur-sm">
      <h3 className="text-sm font-medium mb-3 text-muted-foreground">Spectrum Analyzer</h3>
      <canvas
        ref={canvasRef}
        className="w-full h-24 rounded-lg bg-background/50"
      />
    </div>
  );
}
