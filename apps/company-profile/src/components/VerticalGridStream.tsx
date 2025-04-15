import { useState, useEffect, useMemo } from 'react';

export type VerticalGridStreamProps = {
  images: string[];
  title?: string;
  speed?: number;
  columns?: number;
  className?: string;
  imageWidth?: number;
  imageHeight?: number;

};

const VerticalGridStream = ({
  images = [],
  title = '',
  speed = 20,
  columns = 3,
  className = '',
  imageWidth = 120,
  imageHeight = 80,
}: VerticalGridStreamProps) => {
  const [responsiveColumns, setResponsiveColumns] = useState(columns);

  // Calculate responsive columns
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      let newColumns = columns;

      if (width < 640) { // sm
        newColumns = 1;
      } else if (width < 768) { // md
        newColumns = Math.min(2, columns);
      } else if (width < 1024) { // lg
        newColumns = Math.min(3, columns);
      } else { // xl
        newColumns = columns;
      }

      setResponsiveColumns(newColumns);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [columns]);

  // Memoize column distribution
  const columnContent = useMemo(() => {
    const content: string[][] = Array.from({ length: responsiveColumns }, () => []);
    images.forEach((img, index) => {
      const columnIndex = index % responsiveColumns;
      content[columnIndex].push(img);
    });
    return content;
  }, [images, responsiveColumns]);

  const [columnPositions, setColumnPositions] = useState(() =>
    Array(responsiveColumns).fill(0)
  );

  // Update column positions when columns change
  useEffect(() => {
    setColumnPositions(Array(responsiveColumns).fill(0));
  }, [responsiveColumns]);

  const gap = 20;
  const getColumnHeight = (colIndex: number) => {
    return columnContent[colIndex]?.length ? columnContent[colIndex].length * (imageHeight + gap) : 0;
  };

  // Animation effect
  useEffect(() => {
    const animate = () => {
      setColumnPositions(prev => {
        if (prev.length !== responsiveColumns) return prev;

        return prev.map((pos, colIndex) => {
          const direction = colIndex % 2 === 0 ? 1 : -1;
          const columnHeight = getColumnHeight(colIndex);

          if (Math.abs(pos) >= columnHeight) {
            return 0;
          }

          return pos + (0.5 * direction * speed / 60);
        });
      });
    };

    const animationId = requestAnimationFrame(function loop() {
      animate();
      requestAnimationFrame(loop);
    });

    return () => cancelAnimationFrame(animationId);
  }, [speed, responsiveColumns]);



  const floatKeyframes = `
    @keyframes float-1 {
      0% { transform: translateX(0px); }
      100% { transform: translateX(10px); }
    }
    @keyframes float-2 {
      0% { transform: translateX(0px); }
      100% { transform: translateX(8px); }
    }
    @keyframes float-3 {
      0% { transform: translateX(0px); }
      100% { transform: translateX(12px); }
    }
  `;

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <div className="mb-12 text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            <span className="inline-block mb-2">{title}</span>
            <div className="h-1 w-20 bg-primary-500 mx-auto"></div>
          </h2>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-4 w-full">
        {columnContent.map((column: any, colIndex: number) => (
          <div
            key={`col-${colIndex}`}
            className="overflow-hidden relative h-screen flex justify-center"
            style={{
              width: `calc(${100 / Math.max(1, Math.min(responsiveColumns, 4))}% - 1rem)`,
              minWidth: `${imageWidth + 40}px`
            }}
          >
            <div
              className="flex flex-col items-center"
              style={{
                transform: `translateY(${columnPositions[colIndex]}px)`,
                height: `${getColumnHeight(colIndex) * 2}px`,
              }}
            >
              {[...column, ...column].map((src, imgIndex) => (
                <div
                  key={`img-${colIndex}-${imgIndex}`}
                  className="flex-shrink-0 my-2 group"
                  style={{
                    width: `${imageWidth}px`,
                    height: `${imageHeight}px`,
                    marginBottom: `${gap}px`,
                    animation: `${['float-1', 'float-2', 'float-3'][imgIndex % 3]} ${3 + imgIndex % 2}s ease-in-out infinite alternate`
                  }}
                >
                  <div className="h-full flex flex-col items-center justify-center relative">
                    <img
                      src={src}
                      alt={`Item ${imgIndex + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <style>{floatKeyframes}</style>
    </div>
  );
};

export default VerticalGridStream;