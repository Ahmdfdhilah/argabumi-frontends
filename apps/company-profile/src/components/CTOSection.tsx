// src/components/CTOSection.jsx
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import app from '../assets/app.png';
import app2 from '../assets/app2.png';

export type CTOSectionProps = {
    title: string;
    description: string;
    btnText: string;
    btnLink: string;
    bgColor?: string;          // default: "bg-accent"
    textColor?: string;        // default: "text-primary-500"
    btnBgColor?: string;       // default: "bg-primary-500" 
    btnTextColor?: string;     // default: "text-white"
    className?: string;        // default: ""
    secondaryBtnText?: string; // Optional secondary button
    secondaryBtnLink?: string; // Optional secondary button link
};

function CTOSection({
    title,
    description,
    btnText: primaryBtnText,
    btnLink: primaryBtnLink,
    bgColor = "bg-accent",
    textColor = "text-primary-500",
    btnBgColor = "bg-primary-500",
    btnTextColor = "text-white",
    className = "",
    secondaryBtnText,
    secondaryBtnLink
}: CTOSectionProps) {

    return (
        <section className={`${bgColor} ${className}`} data-testid="cto-section">
            <div className="flex flex-col md:flex-row">
                {/* Content half */}
                <div className={`${textColor} w-full md:w-1/2 py-16 px-6 md:px-12 flex flex-col justify-center`}>
                    <div className="max-w-lg mx-auto md:mx-0">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">{title}</h2>
                        <p className="text-lg mb-8 opacity-90">{description}</p>

                        <div className="flex flex-wrap gap-4">
                            <Link
                                to={primaryBtnLink}
                                className={`${btnBgColor} ${btnTextColor} px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-all duration-300 flex items-center group`}
                                aria-label={primaryBtnText}
                            >
                                {primaryBtnText}
                                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            {secondaryBtnText && secondaryBtnLink && (
                                <Link
                                    to={secondaryBtnLink}
                                    className={`border-2 border-current px-8 py-4 rounded-lg font-medium text-inherit hover:bg-primary-500 hover:text-white transition-all duration-300 flex items-center justify-center`}
                                    aria-label={secondaryBtnText}
                                >
                                    {secondaryBtnText}
                                    <ChevronRight className="ml-1 w-5 h-5" />
                                </Link>

                            )}
                        </div>
                    </div>
                </div>

                {/* Image half */}
                {/* <div className="w-full md:w-1/2 bg-cover bg-center min-h-64 md:min-h-full"
                    style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : { background: 'linear-gradient(135deg, #4f46e5 0%, #8b5cf6 100%)' }}>
                </div> */}
                <div
                    className="relative w-full md:w-1/2 min-h-[50vh] md:min-h-[70vh] lg:min-h-[90vh] flex items-center justify-center"
                >
                    <div className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-6">
                        {/* First App Image */}
                        <img
                            src={app}
                            className="max-w-[80%] sm:max-w-[60%] md:max-w-xs h-auto object-contain rounded-lg transform transition-transform duration-300 hover:scale-110"
                            alt="Mobile App Screenshot"
                        />
                        {/* Second App Image */}
                        <img
                            src={app2}
                            className="hidden lg:block max-w-[80%] sm:max-w-[60%] md:max-w-xs h-auto object-contain rounded-lg transform transition-transform duration-300 hover:scale-110"
                            alt="Mobile App Screenshot 2"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

export default CTOSection;