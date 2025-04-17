import { useState, useEffect, useCallback, SetStateAction } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface CarouselItem {
    id: number;
    title: string;
    description: string;
    category: string;
    imageUrl: string;
    badge?: string;
}

export default function CarouselHero({ items }: { items?: CarouselItem[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [touchStart, setTouchStart] = useState(0);
    const [autoplayPaused, setAutoplayPaused] = useState(false);
    const navigate = useNavigate();
    
    // Default items if none provided
    const defaultItems = [
        {
            id: 1,
            title: "Inovasi Terbaru dalam Teknologi Pertanian",
            description: "Temukan bagaimana teknologi AI mengubah cara petani mengelola lahan mereka",
            category: "Teknologi",
            imageUrl: "https://picsum.photos/id/111/500/300",
            badge: "Terbaru"
        },
        {
            id: 2,
            title: "Program Keberlanjutan Agrikultur 2025",
            description: "Mengembangkan pertanian yang ramah lingkungan dan berkelanjutan",
            category: "Kebijakan",
            imageUrl: "https://picsum.photos/id/112/500/300",
            badge: "Unggulan"
        },
        {
            id: 3,
            title: "Masa Depan Ketahanan Pangan Indonesia",
            description: "Strategi nasional menghadapi tantangan perubahan iklim",
            category: "Analisis",
            imageUrl: "https://picsum.photos/id/113/500/300",
            badge: "Penting"
        }
    ];

    const carouselItems = items || defaultItems;

    // Auto-advance carousel
    useEffect(() => {
        if (autoplayPaused) return;

        const interval = setInterval(() => {
            if (!isAnimating) {
                nextSlide();
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [currentIndex, isAnimating, autoplayPaused]);

    const nextSlide = useCallback(() => {
        if (isAnimating) return;

        setIsAnimating(true);
        setCurrentIndex((prevIndex) =>
            prevIndex === carouselItems.length - 1 ? 0 : prevIndex + 1
        );

        setTimeout(() => setIsAnimating(false), 500);
    }, [carouselItems.length, isAnimating]);

    const prevSlide = useCallback(() => {
        if (isAnimating) return;

        setIsAnimating(true);
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? carouselItems.length - 1 : prevIndex - 1
        );

        setTimeout(() => setIsAnimating(false), 500);
    }, [carouselItems.length, isAnimating]);

    const goToSlide = (index: SetStateAction<number>) => {
        if (isAnimating || index === currentIndex) return;
        setIsAnimating(true);
        setCurrentIndex(index);
        setTimeout(() => setIsAnimating(false), 500);
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        setTouchStart(e.touches[0]?.clientX ?? 0);
        setAutoplayPaused(true);
    };

    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        const touchEnd = e.changedTouches[0]?.clientX;
        if (!touchEnd) return;
        const diff = touchStart - touchEnd;

        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }

        // Resume autoplay after 3 seconds of inactivity
        setTimeout(() => setAutoplayPaused(false), 3000);
    };

    const handleReadMore = (id: number) => {
       navigate(`/news/${id}`);
    };

    return (
        <div
            className="relative w-full overflow-hidden bg-gray-50"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseEnter={() => setAutoplayPaused(true)}
            onMouseLeave={() => setAutoplayPaused(false)}
        >
            {/* Main carousel */}
            <div className="relative h-96 md:h-screen md:max-h-[70vh]">
                {carouselItems.map((item, index) => (
                    <div
                        key={item.id}
                        className={`absolute inset-0 w-full h-full transition-all duration-500 ease-in-out ${
                            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                        }`}
                    >
                        {/* Image as background - using a separate div for the image */}
                        <div className="absolute inset-0 z-0">
                            <img 
                                src={item.imageUrl} 
                                alt={item.title}
                                className="object-cover w-full h-full opacity-20"
                            />
                            {/* Overlay gradient */}
                            <div className="absolute inset-0 bg-primary-600/40 mix-blend-multiply"></div>
                        </div>
                      
                        {/* Content */}
                        <div className="px-4 md:px-8 absolute inset-0 z-20 flex items-center justify-center">
                            <div className="container mx-auto px-6 md:px-12 relative">
                                <div className="max-w-3xl mx-auto md:ml-0">
                                    {/* Category badge */}
                                    <div className="flex gap-2 mb-4">
                                        <span className="inline-block px-3 py-1 text-xs font-semibold bg-primary-600 text-white rounded-full">
                                            {item.category}
                                        </span>
                                        {item.badge && (
                                            <span className="inline-block px-3 py-1 text-xs font-semibold bg-secondary-500 text-white rounded-full">
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>

                                    {/* Title with animated underline */}
                                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 relative group">
                                        {item.title}
                                        <span 
                                            className="absolute -bottom-2 left-0 w-0 h-1 bg-accent transition-all duration-700 group-hover:w-full"
                                            style={{ width: index === currentIndex ? '100%' : '0%' }}
                                        />
                                    </h2>

                                    {/* Description */}
                                    <p className="text-lg md:text-xl text-accent-light mb-8">
                                        {item.description}
                                    </p>

                                    {/* CTA Button */}
                                    <button onClick={() => handleReadMore(item.id)} className="px-6 py-3 bg-secondary-500 text-white font-medium rounded-lg hover:bg-secondary-600 transition-all duration-300 shadow-lg transform hover:translate-y-[-2px]">
                                        Baca Selengkapnya
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Nav buttons */}
            <button
                onClick={prevSlide}
                className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-primary-600/30 hover:bg-primary-600/50 text-white p-2 rounded-full backdrop-blur-sm transition-all duration-300"
                aria-label="Previous slide"
            >
                <ChevronLeft size={24} />
            </button>

            <button
                onClick={nextSlide}
                className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-primary-600/30 hover:bg-primary-600/50 text-white p-2 rounded-full backdrop-blur-sm transition-all duration-300"
                aria-label="Next slide"
            >
                <ChevronRight size={24} />
            </button>

            {/* Indicator dots */}
            <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
                {carouselItems.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === currentIndex
                                ? "bg-white w-8"
                                : "bg-white/50 hover:bg-white/80"
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}