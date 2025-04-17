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
  const [visibleItems, setVisibleItems] = useState(itemsToShow);
  const [isMobile, setIsMobile] = useState(false);
  const timerRef = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const totalItems = items.length;
  const maxIndex = Math.max(0, totalItems - visibleItems);

  // Responsive logic
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      if (width < 640) {
        setVisibleItems(1);
      } else if (width < 1024) {
        setVisibleItems(Math.min(2, itemsToShow));
      } else {
        setVisibleItems(itemsToShow);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [itemsToShow]);

  // Auto swipe logic (only if not mobile)
  useEffect(() => {
    const startTimer = () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);

      timerRef.current = window.setTimeout(() => {
        if (!isHovering && !isMobile && totalItems > visibleItems) {
          setCurrentIndex(prevIndex =>
            prevIndex >= maxIndex ? 0 : prevIndex + 1
          );
        }
        startTimer();
      }, autoSwipeInterval);
    };

    startTimer();
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, [currentIndex, isHovering, isMobile, totalItems, visibleItems, autoSwipeInterval, maxIndex]);

  const goToNext = () => {
    setCurrentIndex(prevIndex => (prevIndex >= maxIndex ? 0 : prevIndex + 1));
  };

  const goToPrev = () => {
    setCurrentIndex(prevIndex => (prevIndex <= 0 ? maxIndex : prevIndex - 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX || null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0]?.clientX || null;
    const diff = touchStartX.current - (touchEndX || 0);
    if (diff > 50) goToNext();
    else if (diff < -50) goToPrev();
    touchStartX.current = null;
  };

  const indicators = [];
  for (let i = 0; i <= maxIndex; i++) {
    indicators.push(i);
  }

  return (
    <div className={cn("w-full py-8", className)}>
      {title && (
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
          <span className="inline-block mb-2">{title}</span>
          <div className="h-1 w-20 bg-primary-500 mx-auto"></div>
        </h2>
      )}

      <div
        className="relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className={cn(!isMobile && "overflow-hidden")}>
          <div
            className={cn(
              "flex gap-4",
              isMobile && "overflow-x-auto scroll-snap-x snap-x scroll-smooth"
            )}
            style={
              !isMobile
                ? {
                    transform: `translateX(-${(currentIndex * 100) / visibleItems}%)`,
                    width: `${(totalItems / visibleItems) * 100}%`,
                    transition: "transform 0.5s ease-in-out",
                  }
                : {}
            }
          >
            {items.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "shrink-0 px-2",
                  isMobile ? "snap-start w-[calc(100%-1rem)]" : ""
                )}
                style={
                  !isMobile ? { width: `${100 / totalItems}%` } : undefined
                }
              >
                <Card className="h-full overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="p-0 h-full flex flex-col">
                    {item.imageUrl && (
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
        {!isMobile && totalItems > visibleItems && (
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
        {!isMobile && indicators.length > 1 && (
          <div className="flex justify-center mt-4 gap-1.5">
            {indicators.map((i) => (
              <button
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === currentIndex ? 'w-6 bg-primary' : 'w-2 bg-gray-300 hover:bg-gray-400'
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