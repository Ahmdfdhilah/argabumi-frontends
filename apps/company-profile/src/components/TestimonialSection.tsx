import { Section } from '@workspace/ui/components/ui/section';
import { Card, CardContent } from "@workspace/ui/components/card";
import { useState, useEffect, useRef } from 'react';
import { Play, X, MaximizeIcon } from "lucide-react";

// Define possible media types
type TestimonialMediaType = 'image' | 'youtube' | null;

// Define possible service types for your company
type ServiceType = 'Coffee Processing' | 'Farmer Support' | 'Export Services' | 'Training' | 'Consultation';

// Enhanced testimonial interface
interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  avatarSrc: string; // Avatar is required for all testimonials
  serviceType: ServiceType;
  mediaType: TestimonialMediaType;
  mediaSrc?: string; // Optional: Image URL or YouTube video ID
  company?: string; // Optional company name
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  title: string;
  subtitle?: string;
}

const YouTubeThumbnail = ({ videoId, onFullscreen }: { videoId: string, onFullscreen: () => void }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  if (isPlaying) {
    return (
      <div className="aspect-video w-full rounded-lg overflow-hidden relative">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title="YouTube video player"
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div
      className="relative aspect-video w-full rounded-lg overflow-hidden cursor-pointer bg-black"
    >
      <img
        src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
        alt="YouTube thumbnail"
        className="w-full h-full object-cover opacity-80"
        onClick={() => setIsPlaying(true)}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="bg-primary-600 bg-opacity-90 rounded-full p-4 text-white"
          onClick={() => setIsPlaying(true)}
        >
          <Play size={24} />
        </div>
      </div>
      <button
        className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1 text-white hover:bg-opacity-70 transition-opacity"
        onClick={onFullscreen}
      >
        <MaximizeIcon size={16} />
      </button>
    </div>
  );
};

// Service type badge
const ServiceTypeBadge = ({ serviceType }: { serviceType: ServiceType }) => {
  // Color mapping for different service types
  const colorMap: Record<ServiceType, string> = {
    'Coffee Processing': 'bg-amber-100 text-amber-800',
    'Farmer Support': 'bg-green-100 text-green-800',
    'Export Services': 'bg-blue-100 text-blue-800',
    'Training': 'bg-purple-100 text-purple-800',
    'Consultation': 'bg-indigo-100 text-indigo-800',
  };

  return (
    <div className="mb-3">
      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${colorMap[serviceType]}`}>
        {serviceType}
      </span>
    </div>
  );
};

// Fullscreen Modal Component
const FullscreenModal = ({
  isOpen,
  onClose,
  mediaType,
  mediaSrc
}: {
  isOpen: boolean,
  onClose: () => void,
  mediaType: TestimonialMediaType,
  mediaSrc?: string
}) => {
  if (!isOpen || !mediaSrc) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <button
        className="absolute top-4 right-4 bg-white rounded-full p-2 text-black"
        onClick={onClose}
      >
        <X size={24} />
      </button>

      <div className="w-full max-w-6xl max-h-screen p-4">
        {mediaType === 'image' && (
          <img
            src={mediaSrc}
            alt="Fullscreen view"
            className="max-w-full max-h-[90vh] mx-auto object-contain"
          />
        )}

        {mediaType === 'youtube' && (
          <div className="aspect-video w-full max-h-[90vh]">
            <iframe
              src={`https://www.youtube.com/embed/${mediaSrc}?autoplay=1`}
              title="YouTube video player"
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </div>
  );
};

const TestimonialCard = ({
  testimonial,
  onFullscreen
}: {
  testimonial: Testimonial,
  onFullscreen: (type: TestimonialMediaType, src?: string) => void
}) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg h-full flex flex-col">
      <CardContent className="p-6 flex flex-col flex-grow">
        {/* Service type badge */}
        <ServiceTypeBadge serviceType={testimonial.serviceType} />

        <p className="italic mb-6 text-primary-700">
          "{testimonial.content}"
        </p>

        {/* Media container - only shown if mediaType is present */}
        {testimonial.mediaType && testimonial.mediaSrc && (
          <div className="mb-6 aspect-video w-full">
            {testimonial.mediaType === 'youtube' && (
              <YouTubeThumbnail
                videoId={testimonial.mediaSrc}
                onFullscreen={() => onFullscreen(testimonial.mediaType, testimonial.mediaSrc)}
              />
            )}

            {testimonial.mediaType === 'image' && (
              <div className="relative aspect-video w-full rounded-lg overflow-hidden">
                <img
                  src={testimonial.mediaSrc}
                  alt="Testimonial image"
                  className="w-full h-full object-cover"
                  onClick={() => onFullscreen(testimonial.mediaType, testimonial.mediaSrc)}
                />
                <button
                  className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1 text-white hover:bg-opacity-70 transition-opacity"
                  onClick={() => onFullscreen(testimonial.mediaType, testimonial.mediaSrc)}
                >
                  <MaximizeIcon size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Avatar and identity - always present */}
        <div className="flex items-center mt-auto">
          <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
            {testimonial.avatarSrc ? (
              <img
                src={testimonial.avatarSrc}
                alt={testimonial.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary-200 text-primary-600 font-bold text-lg">
                {testimonial.name[0]}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-primary-700">
              {testimonial.name}
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center">
              <p className="text-secondary-500 text-sm">{testimonial.role}</p>
              {testimonial.company && (
                <>
                  <span className="hidden sm:inline mx-2 text-secondary-500">•</span>
                  <p className="text-sm text-secondary-400">{testimonial.company}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TestimonialsSection = ({
  testimonials,
  title,
  subtitle
}: TestimonialsSectionProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [fullscreenMedia, setFullscreenMedia] = useState<{ type: TestimonialMediaType, src?: string } | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const autoSlideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Responsive items per view
  const [itemsPerView, setItemsPerView] = useState(1);

  // Update items to show on window resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setItemsPerView(1);
      } else if (width < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset active index when items per view changes to prevent empty slides
  useEffect(() => {
    const maxIndex = Math.max(0, Math.ceil(testimonials.length / itemsPerView) - 1);
    if (activeIndex > maxIndex) {
      setActiveIndex(maxIndex);
    }
  }, [itemsPerView, testimonials.length, activeIndex]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      // Swipe left
      handleNext();
    }

    if (touchEnd - touchStart > 50) {
      // Swipe right
      handlePrev();
    }
  };

  // Reset and setup auto advance carousel
  useEffect(() => {
    // Clear existing interval if any
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
    }

    // Set new interval
    autoSlideRef.current = setInterval(() => {
      if (!transitioning) {
        handleNext();
      }
    }, 10000);

    // Cleanup on unmount
    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
    };
  }, [transitioning, testimonials.length, itemsPerView]);

  const handleNext = () => {
    if (transitioning) return;

    setTransitioning(true);

    setActiveIndex(prev => {
      const maxIndex = Math.max(0, Math.ceil(testimonials.length / itemsPerView) - 1);
      return prev >= maxIndex ? 0 : prev + 1;
    });

    // Reset transitioning after animation completes
    setTimeout(() => {
      setTransitioning(false);
    }, 500);
  };

  const handlePrev = () => {
    if (transitioning) return;

    setTransitioning(true);

    setActiveIndex(prev => {
      const maxIndex = Math.max(0, Math.ceil(testimonials.length / itemsPerView) - 1);
      return prev <= 0 ? maxIndex : prev - 1;
    });

    // Reset transitioning after animation completes
    setTimeout(() => {
      setTransitioning(false);
    }, 500);
  };

  const handleDotClick = (index: number) => {
    if (transitioning) return;

    setTransitioning(true);
    setActiveIndex(index);

    // Reset transitioning after animation completes
    setTimeout(() => {
      setTransitioning(false);
    }, 500);
  };

  const openFullscreen = (type: TestimonialMediaType, src?: string) => {
    setFullscreenMedia({ type, src });

    // Pause auto-sliding when viewing fullscreen
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
      autoSlideRef.current = null;
    }
  };

  const closeFullscreen = () => {
    setFullscreenMedia(null);

    // Resume auto-sliding when closing fullscreen
    if (!autoSlideRef.current) {
      autoSlideRef.current = setInterval(() => {
        if (!transitioning) {
          handleNext();
        }
      }, 10000);
    }
  };

  // Calculate total number of pages
  const pageCount = Math.max(1, Math.ceil(testimonials.length / itemsPerView));

  return (
    <Section className="md:px-8 py-16">
      <div className="mx-auto">
        {title && (
          <div className="mb-12 text-center relative">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              <span className="inline-block mb-2">{title}</span>
              <div className="h-1 w-20 bg-primary-500 mx-auto"></div>
            </h2>
            {subtitle && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Carousel Container */}
        <div
          className="relative overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Navigation buttons */}
          {pageCount > 1 && (
            <div className='hidden md:flex'>
              <button
                onClick={handlePrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-lg p-2 md:p-3 hover:bg-gray-100"
                aria-label="Previous slide"
                disabled={transitioning}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary-600">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              <button
                onClick={handleNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-lg p-2 md:p-3 hover:bg-gray-100"
                aria-label="Next slide"
                disabled={transitioning}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary-600">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          )}

          {/* Carousel Track - Fixed width container */}
          <div className="overflow-hidden px-1 md:px-8">
            {/* Carousel Slider - Moving content */}
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${activeIndex * (100 / pageCount)}%)`,
                width: `${pageCount * 100}%`
              }}
            >
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className={`px-3 ${itemsPerView === 1 ? 'w-full' :
                      itemsPerView === 2 ? 'w-1/2' :
                        'w-1/3'
                    }`}
                  style={{ width: `${100 / (pageCount * itemsPerView)}%` }}
                >
                  <TestimonialCard
                    testimonial={testimonial}
                    onFullscreen={openFullscreen}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation dots - One dot per page/screen of items */}
        {pageCount > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: pageCount }).map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${activeIndex === index
                    ? 'bg-primary-600'
                    : 'bg-gray-300 hover:bg-primary-300'
                  }`}
                onClick={() => handleDotClick(index)}
                aria-label={`Go to slide ${index + 1}`}
                disabled={transitioning}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <FullscreenModal
        isOpen={fullscreenMedia !== null}
        onClose={closeFullscreen}
        mediaType={fullscreenMedia?.type || null}
        mediaSrc={fullscreenMedia?.src}
      />
    </Section>
  );
};

export default TestimonialsSection;