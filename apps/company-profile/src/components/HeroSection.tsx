// src/components/HeroSection.jsx
import { ArrowRight, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Waves } from "@workspace/ui/components/ui/waves";

const HeroSection = ({
    title = "Welcome to Our Company",
    subtitle = "Your trusted partner for innovative solutions",
    primaryBtnText = "Get Started",
    primaryBtnLink = "/contact",
    secondaryBtnText = "Learn More",
    secondaryBtnLink = "/about"
}) => {

    const waves = [
        { color: '#46B749', height: 80, speed: 0.3 },    
        { color: '#1B6131', height: 120, amplitude: 15 },    
        { color: '#46B749', height: 160, speed: 0.6, opacity: 0.8 },  
        { color: '#E4EFCF', height: 200, amplitude: 10 }   
    ];

    return (
        <div className="relative overflow-hidden bg-accent text-primary-500 min-h-screen flex items-center justify-center">
            {/* Animated Wave Background */}
            <div className="absolute inset-0 z-0">
                <Waves 
                    waves={waves} 
                    baseSpeed={0.5} 
                    baseAmplitude={20} 
                />
            </div>

            {/* Content  */}
            <div className="relative z-10 w-full px-4 mb-8">
                <div className="mx-auto max-w-3xl text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">{title}</h1>
                    <p className="text-lg md:text-xl mb-8 md:mb-10 text-secondary-500 text-opacity-90">{subtitle}</p>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
                        <Link
                            to={primaryBtnLink}
                            className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-3 rounded-lg font-medium hover:opacity-90 transition-all duration-300 flex items-center group justify-center"
                            aria-label={primaryBtnText}
                        >
                            {primaryBtnText}
                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to={secondaryBtnLink}
                            className="border-2 border-current px-6 py-2 sm:px-8 sm:py-3 rounded-lg font-medium text-inherit hover:bg-primary-500 hover:text-white transition-all duration-300 flex items-center justify-center"
                            aria-label={secondaryBtnText}
                        >
                            {secondaryBtnText}
                            <ChevronRight className="ml-1 w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;