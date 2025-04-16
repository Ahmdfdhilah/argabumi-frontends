import { useState, useEffect, useMemo, useRef } from 'react';

export type VerticalGridStreamProps = {
  images: string[];
  title?: string;
  speed?: number;
  className?: string;
  imageWidth?: number;
  imageHeight?: number;
  gap?: number;
};

const VerticalGridStream = ({
  images = [],
  title = '',
  speed = 20,
  className = '',
  imageWidth = 120,
  imageHeight = 80,
  gap = 20,
}: VerticalGridStreamProps) => {
  const [responsiveColumns, setResponsiveColumns] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number>(0);

  // Responsive columns calculation
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setResponsiveColumns(1);
      else if (width < 768) setResponsiveColumns(2);
      else if (width < 1024) setResponsiveColumns(3);
      else setResponsiveColumns(4);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prepare column data with seamless looping in mind
  const columnContent = useMemo(() => {
    if (images.length === 0) return Array(responsiveColumns).fill([]);
    
    const content: string[][] = Array.from({ length: responsiveColumns }, () => []);
    const viewportHeight = window.innerHeight;
    
    // Calculate items needed to fill screen with buffer
    const itemsPerViewport = Math.ceil(viewportHeight / (imageHeight + gap));
    const minItemsPerColumn = itemsPerViewport * 2 + 4; // Double viewport + buffer
    
    // Duplicate images to ensure we have enough
    const extendedImages = [];
    while (extendedImages.length < minItemsPerColumn * responsiveColumns) {
      extendedImages.push(...images);
    }
    
    // Distribute to columns with some randomness
    const shuffledImages = [...extendedImages].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < minItemsPerColumn * responsiveColumns; i++) {
      const colIndex = i % responsiveColumns;
      content[colIndex].push(shuffledImages[i % shuffledImages.length]);
    }
    
    return content;
  }, [images, responsiveColumns, imageHeight, gap]);

  const [columnPositions, setColumnPositions] = useState<number[]>([]);

  // Initialize column positions
  useEffect(() => {
    setColumnPositions(Array(responsiveColumns).fill(0));
  }, [responsiveColumns]);

  // Improved animation with frame-rate independent movement
  const animate = (time: number) => {
    if (previousTimeRef.current === undefined) {
      previousTimeRef.current = time;
    }
    
    const deltaTime = time - previousTimeRef.current;
    previousTimeRef.current = time;

    setColumnPositions(prevPositions => {
      return prevPositions.map((pos, colIndex) => {
        const column = columnContent[colIndex];
        if (!column || column.length === 0) return 0;
        
        const direction = colIndex % 2 === 0 ? 1 : -1; // Alternate directions
        const columnHeight = column.length * (imageHeight + gap);
        
        // Frame-rate independent movement (pixels per second)
        const movement = (direction * speed * deltaTime) / 1000;
        let newPos = pos + movement;
        
        // Seamless looping for both directions
        if (direction > 0 && newPos >= columnHeight) {
          newPos -= columnHeight;
        } else if (direction < 0 && newPos <= -columnHeight) {
          newPos += columnHeight;
        }
        
        // Additional safety check
        newPos = newPos % columnHeight;
        
        return newPos;
      });
    });

    requestRef.current = requestAnimationFrame(animate);
  };

  // Animation lifecycle
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [speed, columnContent, imageHeight, gap]);

  return (
    <div className={`w-full overflow-hidden ${className}`} ref={containerRef}>
      {title && (
        <div className="mb-12 text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            <span className="inline-block mb-2">{title}</span>
            <div className="h-1 w-20 bg-primary-500 mx-auto"></div>
          </h2>
        </div>
      )}

      <div className="flex justify-center gap-4 w-full">
        {columnContent.map((column, colIndex) => (
          <div
            key={`col-${colIndex}`}
            className="relative overflow-hidden"
            style={{
              height: '100vh',
              width: `calc(${100 / Math.max(responsiveColumns, 1)}% - ${gap}px)`,
              minWidth: `${imageWidth}px`
            }}
          >
            {/* Main column content */}
            <div
              className="flex flex-col items-center will-change-transform"
              style={{
                transform: `translateY(${columnPositions[colIndex] || 0}px)`,
                position: 'absolute',
                width: '100%',
              }}
            >
              {column.map((src: string | undefined, imgIndex: number) => (
                <div
                  key={`img-${colIndex}-${imgIndex}`}
                  className="flex-shrink-0"
                  style={{
                    width: `${imageWidth}px`,
                    height: `${imageHeight}px`,
                    margin: `${gap / 2}px 0`,
                  }}
                >
                  <img
                    src={src}
                    alt={`Item ${imgIndex + 1}`}
                    className="w-full h-full"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
            
            {/* Clone for seamless looping */}
            <div
              className="flex flex-col items-center will-change-transform"
              style={{
                transform: `translateY(${(columnPositions[colIndex] || 0) - 
                  (colIndex % 2 === 0 ? 1 : -1) * column.length * (imageHeight + gap)}px)`,
                position: 'absolute',
                width: '100%',
              }}
            >
              {column.map((src: string | undefined, imgIndex: number) => (
                <div
                  key={`clone-${colIndex}-${imgIndex}`}
                  className="flex-shrink-0"
                  style={{
                    width: `${imageWidth}px`,
                    height: `${imageHeight}px`,
                    margin: `${gap / 2}px 0`,
                  }}
                >
                  <img
                    src={src}
                    alt={`Item ${imgIndex + 1}`}
                    className="w-full h-full"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VerticalGridStream;