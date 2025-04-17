import React, { useEffect, useRef, useState } from 'react';

interface Wave {
  color: string;
  speed?: number;
  amplitude?: number;
  height: number;
}

interface WavesProps {
  waves: Wave[];
  baseSpeed?: number;
  baseAmplitude?: number;
  containerClassName?: string;
}

export const Waves: React.FC<WavesProps> = ({
  waves,
  baseSpeed = 0.5,
  baseAmplitude = 20,
  containerClassName = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Handle resize and set initial dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({
          width: clientWidth,
          height: clientHeight
        });
      }
    };

    // Initial setup
    updateDimensions();
    
    // Add event listener for window resize
    window.addEventListener('resize', updateDimensions);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Draw waves animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0 || dimensions.height === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container with pixel ratio for clearer rendering
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * pixelRatio;
    canvas.height = dimensions.height * pixelRatio;
    ctx.scale(pixelRatio, pixelRatio);
    
    // Set canvas display size
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;

    const drawWaves = (timestamp: number) => {
      if (startTimeRef.current === null) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;

      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      waves.forEach((wave, index) => {
        ctx.beginPath();
        ctx.moveTo(0, dimensions.height);

        const waveSpeed = wave.speed || baseSpeed;
        const waveAmplitude = wave.amplitude || baseAmplitude;
        const waveHeight = wave.height;
        
        // Calculate wave points based on canvas width with consistent resolution
        const step = Math.max(1, Math.floor(dimensions.width / 200)); // More points for smoother rendering
        for (let x = 0; x <= dimensions.width; x += step) {
          const frequency = 0.01 + index * 0.005;
          const y = Math.sin(x * frequency + elapsed * waveSpeed * 0.002 + (index * Math.PI * 2) / waves.length) * waveAmplitude;
          ctx.lineTo(x, dimensions.height - waveHeight + y);
        }

        // Close the path
        ctx.lineTo(dimensions.width, dimensions.height);
        ctx.lineTo(0, dimensions.height);
        
        ctx.fillStyle = wave.color;
        ctx.globalAlpha = 0.5; // Set transparency
        ctx.fill();
        ctx.globalAlpha = 1; // Reset transparency
      });

      animationRef.current = requestAnimationFrame(drawWaves);
    };

    // Start the animation
    animationRef.current = requestAnimationFrame(drawWaves);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, waves, baseSpeed, baseAmplitude]);

  return (
    <div 
      ref={containerRef}
      className={`w-full h-full overflow-hidden ${containerClassName}`}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block' }}
      />
    </div>
  );
};

export default Waves;