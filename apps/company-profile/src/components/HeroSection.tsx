// src/components/HeroSection.jsx
import { ArrowRight, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = ({
    title = "Welcome to Our Company",
    subtitle = "Your trusted partner for innovative solutions",
    primaryBtnText = "Get Started",
    primaryBtnLink = "/contact",
    secondaryBtnText = "Learn More",
    secondaryBtnLink = "/about"
}) => {
    return (
        <div className="relative overflow-hidden bg-accent text-primary-500 min-h-screen">
            {/* Animated Wave Background */}
            <div className="absolute inset-0 z-0">
                <svg
                    className="absolute bottom-0 left-0 w-full"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1440 320"
                >
                    <path
                        fill="white"
                        fillOpacity="1"
                        className="wave-1"
                        d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    >
                        <animate
                            attributeName="d"
                            dur="20s"
                            repeatCount="indefinite"
                            values="
                M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                M0,128L48,154.7C96,181,192,235,288,234.7C384,235,480,181,576,181.3C672,181,768,235,864,250.7C960,267,1056,245,1152,213.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z
              "
                        />
                    </path>
                    <path
                        fill="white"
                        fillOpacity="1"
                        className="wave-2"
                        d="M0,256L48,261.3C96,267,192,277,288,277.3C384,277,480,267,576,240C672,213,768,171,864,165.3C960,160,1056,192,1152,197.3C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    >
                        <animate
                            attributeName="d"
                            dur="15s"
                            repeatCount="indefinite"
                            values="
                M0,256L48,261.3C96,267,192,277,288,277.3C384,277,480,267,576,240C672,213,768,171,864,165.3C960,160,1056,192,1152,197.3C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                M0,224L48,229.3C96,235,192,245,288,245.3C384,245,480,235,576,208C672,181,768,139,864,133.3C960,128,1056,160,1152,170.7C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                M0,256L48,261.3C96,267,192,277,288,277.3C384,277,480,267,576,240C672,213,768,171,864,165.3C960,160,1056,192,1152,197.3C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z
              "
                        />
                    </path>
                    <path
                        fill="white"
                        fillOpacity="1"
                        className="wave-3"
                        d="M0,288L48,272C96,256,192,224,288,218.7C384,213,480,235,576,229.3C672,224,768,192,864,181.3C960,171,1056,181,1152,192C1248,203,1344,213,1392,218.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    >
                        <animate
                            attributeName="d"
                            dur="25s"
                            repeatCount="indefinite"
                            values="
                M0,288L48,272C96,256,192,224,288,218.7C384,213,480,235,576,229.3C672,224,768,192,864,181.3C960,171,1056,181,1152,192C1248,203,1344,213,1392,218.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                M0,256L48,256C96,256,192,256,288,240C384,224,480,192,576,197.3C672,203,768,245,864,261.3C960,277,1056,267,1152,250.7C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                M0,288L48,272C96,256,192,224,288,218.7C384,213,480,235,576,229.3C672,224,768,192,864,181.3C960,171,1056,181,1152,192C1248,203,1344,213,1392,218.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z
              "
                        />
                    </path>
                </svg>
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 py-32 md:pt-48 relative z-10">
                <div className="text-center max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">{title}</h1>
                    <p className="text-xl mb-10 text-secondary-500 text-opacity-90">{subtitle}</p>
                    <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                        <Link
                            to={primaryBtnLink}
                            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-all duration-300 flex items-center group justify-center"
                            aria-label={primaryBtnText}
                        >
                            {primaryBtnText}
                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to={secondaryBtnLink}
                            className={`border-2 border-current px-8 py-4 rounded-lg font-medium text-inherit hover:bg-primary-500 hover:text-white transition-all duration-300 flex items-center justify-center`}
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