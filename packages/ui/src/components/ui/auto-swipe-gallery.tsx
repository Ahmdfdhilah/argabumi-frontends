// src/components/AutoSwipeGallery.tsx
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

// Types for our gallery items
export interface GalleryItem {
  id: string | number;
  title: string;
  description: string;
  imageUrl?: string;
  link?: string;
  date?: string;
  category?: string;
}

interface AutoSwipeGalleryProps {
  items: GalleryItem[];
  title?: string;
  autoSwipeInterval?: number;
  itemsToShow?: number;
  className?: string;
  variant?: 'news' | 'services';
}

const AutoSwipeGallery = ({
  items,
  title,
  autoSwipeInterval = 5000,
  itemsToShow = 3,
  className,
  variant = 'news'
}: AutoSwipeGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const timerRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const totalItems = items.length;
  const maxIndex = Math.max(0, totalItems - itemsToShow);

  // Adjust items to show based on screen size
  const [visibleItems, setVisibleItems] = useState(itemsToShow);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleItems(1);
      } else if (window.innerWidth < 1024) {
        setVisibleItems(Math.min(2, itemsToShow));
      } else {
        setVisibleItems(itemsToShow);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [itemsToShow]);

  useEffect(() => {
    const startTimer = () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = window.setTimeout(() => {
        if (!isHovering && totalItems > visibleItems) {
          setCurrentIndex(prevIndex =>
            prevIndex >= maxIndex ? 0 : prevIndex + 1
          );
        }
        startTimer();
      }, autoSwipeInterval);
    };

    startTimer();

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentIndex, isHovering, totalItems, visibleItems, autoSwipeInterval, maxIndex]);

  const goToNext = () => {
    setCurrentIndex(prevIndex =>
      prevIndex >= maxIndex ? 0 : prevIndex + 1
    );
  };

  const goToPrev = () => {
    setCurrentIndex(prevIndex =>
      prevIndex <= 0 ? maxIndex : prevIndex - 1
    );
  };

  // Touch events for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX || null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;

    const touchEndX = e.changedTouches[0]?.clientX || null;
    const diff = touchStartX.current - (touchEndX || 0);

    // Swipe right to left (next)
    if (diff > 50) {
      goToNext();
    }
    // Swipe left to right (prev)
    else if (diff < -50) {
      goToPrev();
    }

    touchStartX.current = null;
  };

  // Calculate indicators
  const indicators = [];
  for (let i = 0; i <= maxIndex; i += 1) {
    indicators.push(i);
  }

  return (
    <div className={cn("w-full py-8", className)}>
      {title && (
        <h2 className="text-3xl font-bold mb-12 text-center">
          {title}
        </h2>
      )}

      <div className="relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${(currentIndex * 100) / visibleItems}%)`,
              width: `${(totalItems / visibleItems) * 100}%`
            }}
          >
            {items.map((item) => (
              <div
                key={item.id}
                className="px-2"
                style={{ width: `${100 / totalItems}%` }}
              >
                <Card className="h-full overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="p-0 h-full flex flex-col">
                    {
                      item.imageUrl && (
                        <div className="relative aspect-video w-full overflow-hidden">

                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />

                          {variant === 'news' && item.category && (
                            <span className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                              {item.category}
                            </span>
                          )}
                        </div>
                      )}
                    <div className="p-4 flex flex-col flex-grow">
                      {variant === 'news' && item.date && (
                        <p className="text-sm text-gray-500 mb-2">{item.date}</p>
                      )}
                      <h3 className="font-bold text-lg mb-2 line-clamp-2">{item.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">{item.description}</p>
                      <div className="mt-auto">
                        {item.link && (
                          <a
                            href={item.link}
                            className="text-primary font-medium hover:underline inline-flex items-center"
                          >
                            {variant === 'news' ? 'Read More' : 'Learn More'}
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation arrows */}
        {totalItems > visibleItems && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white shadow-md border-gray-200 hover:bg-gray-100 z-10"
              onClick={goToPrev}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full bg-white shadow-md border-gray-200 hover:bg-gray-100 z-10"
              onClick={goToNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Indicators */}
        {indicators.length > 1 && (
          <div className="flex justify-center mt-4 gap-1.5">
            {indicators.map((i) => (
              <button
                key={i}
                className={`h-2 rounded-full transition-all ${i === currentIndex ? 'w-6 bg-primary' : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoSwipeGallery;