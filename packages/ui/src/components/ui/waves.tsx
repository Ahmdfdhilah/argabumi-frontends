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

    let animationFrameId: number;
    let startTime: number | null = null;

    // Set canvas size to match container
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const drawWaves = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      waves.forEach((wave, index) => {
        ctx.beginPath();
        ctx.moveTo(0, dimensions.height);

        const waveSpeed = wave.speed || baseSpeed;
        const waveAmplitude = wave.amplitude || baseAmplitude;
        const waveHeight = wave.height;
        
        // Calculate wave points based on canvas width
        for (let x = 0; x <= dimensions.width; x += Math.max(1, Math.floor(dimensions.width / 100))) {
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

      animationFrameId = requestAnimationFrame(drawWaves);
    };

    animationFrameId = requestAnimationFrame(drawWaves);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [dimensions, waves, baseSpeed, baseAmplitude]);

  return (
    <div 
      ref={containerRef}
      className={`w-full h-full ${containerClassName}`}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default Waves;