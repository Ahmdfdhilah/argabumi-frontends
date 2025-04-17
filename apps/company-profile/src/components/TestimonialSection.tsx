import { Section } from '@workspace/ui/components/ui/section';
import { Card, CardContent } from "@workspace/ui/components/card";
import { useState, useEffect } from 'react';
import { Play } from "lucide-react";

// Define possible media types
type TestimonialMediaType = 'avatar' | 'image' | 'youtube';

// Enhanced testimonial interface with media options
interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  mediaType: TestimonialMediaType;
  mediaSrc: string; // Avatar URL, image URL, or YouTube video ID
  rating?: number; // Optional star rating (1-5)
  company?: string; // Optional company name
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  title: string;
  subtitle?: string;
  layout?: 'grid' | 'carousel';
  theme?: 'light' | 'dark';
}

const YouTubeThumbnail = ({ videoId }: { videoId: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  if (isPlaying) {
    return (
      <div className="aspect-video w-full rounded-lg overflow-hidden">
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
      onClick={() => setIsPlaying(true)}
    >
      <img 
        src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
        alt="YouTube thumbnail"
        className="w-full h-full object-cover opacity-80"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-primary-600 bg-opacity-90 rounded-full p-4 text-white">
          <Play size={24} />
        </div>
      </div>
    </div>
  );
};

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center mb-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? "text-secondary-500" : "text-gray-300"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const TestimonialCard = ({ testimonial, theme = 'light' }: { testimonial: Testimonial, theme?: 'light' | 'dark' }) => {

  return (
    <Card className='overflow-hidden transition-all duration-300  hover:shadow-lg h-full flex flex-col'>
      <CardContent className="p-6 flex flex-col flex-grow">
        {testimonial.rating && <StarRating rating={testimonial.rating} />}
        
        <p className={`italic mb-6 ${theme === 'dark' ? 'text-accent-light' : 'text-primary-700'}`}>
          "{testimonial.content}"
        </p>

        {/* Media container with fixed height for all types */}
        <div className="mb-6 h-48 w-full"> {/* Fixed height for all media */}
          {testimonial.mediaType === 'youtube' && (
            <YouTubeThumbnail videoId={testimonial.mediaSrc} />
          )}
          
          {testimonial.mediaType === 'image' && (
            <img 
              src={testimonial.mediaSrc}
              alt="Testimonial image" 
              className="w-full h-full object-cover rounded-lg"
            />
          )}
        </div>
        
        <div className="flex items-center mt-auto">
          <div className={`w-12 h-12 rounded-full overflow-hidden mr-4 ${testimonial.mediaType === 'avatar' ? '' : 'bg-primary-100'}`}>
            {testimonial.mediaType === 'avatar' && (
              <img 
                src={testimonial.mediaSrc} 
                alt={testimonial.name} 
                className="w-full h-full object-cover"
              />
            )}
            {testimonial.mediaType !== 'avatar' && (
              <div className="w-full h-full flex items-center justify-center bg-primary-200 text-primary-600 font-bold text-lg">
                {testimonial.name[0]}
              </div>
            )}
          </div>
          <div>
            <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-primary-700'}`}>
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
  subtitle,
  layout = 'grid',
  theme = 'light'
}: TestimonialsSectionProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      // Swipe left
      setActiveIndex(prev => (prev + 1) % testimonials.length);
    }

    if (touchEnd - touchStart > 50) {
      // Swipe right
      setActiveIndex(prev => (prev - 1 + testimonials.length) % testimonials.length);
    }
  };

  // Auto advance carousel every 7 seconds
  useEffect(() => {
    if (layout === 'carousel') {
      const interval = setInterval(() => {
        setActiveIndex(prev => (prev + 1) % testimonials.length);
      }, 7000);
      return () => clearInterval(interval);
    }
  }, [layout, testimonials.length]);

  const renderGrid = () => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {testimonials.map((testimonial) => (
        <TestimonialCard key={testimonial.id} testimonial={testimonial} theme={theme} />
      ))}
    </div>
  );

  const renderCarousel = () => (
    <div 
      className="relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="w-full flex-shrink-0">
            <TestimonialCard testimonial={testimonial} theme={theme} />
          </div>
        ))}
      </div>
      
      {/* Navigation dots */}
      <div className="flex justify-center mt-6 space-x-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${
              activeIndex === index 
                ? 'bg-primary-600' 
                : 'bg-gray-300 hover:bg-primary-300'
            }`}
            onClick={() => setActiveIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );

  return (
    <Section className="px-4 md:px-8 lg:px-16 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3 text-primary-600">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
          <div className="h-1 w-20 bg-secondary-500 mx-auto mt-4"></div>
        </div>
        
        {layout === 'grid' ? renderGrid() : renderCarousel()}
      </div>
    </Section>
  );
};

export default TestimonialsSection;