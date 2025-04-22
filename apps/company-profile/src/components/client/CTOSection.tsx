// src/components/AnimatedCTOSection.jsx
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import app from '../../assets/app.png';
import app2 from '../../assets/app2.png';
import { AnimatedSection, fadeInUp, slideInRight, slideInLeft, StaggeredList } from '@workspace/ui/components/ui/animated-section';

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

function AnimatedCTOSection({
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
                {/* Content half with animations */}
                <AnimatedSection 
                    variants={slideInLeft} 
                    triggerOnce={false}
                    className={`${textColor} w-full md:w-1/2 py-16 px-6 md:px-12 flex flex-col justify-center`}
                    threshold={0.2}
                >
                    <div className="max-w-lg mx-auto md:mx-0">
                        <AnimatedSection 
                            variants={fadeInUp} 
                            delay={0.2} 
                            className="mb-6"
                            triggerOnce={false}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>
                        </AnimatedSection>
                        
                        <AnimatedSection 
                            variants={fadeInUp} 
                            delay={0.4} 
                            className="mb-8"
                            triggerOnce={false}
                        >
                            <p className="text-lg opacity-90">{description}</p>
                        </AnimatedSection>

                        <StaggeredList 
                            staggerDelay={0.15} 
                            initialDelay={0.6} 
                            className="flex flex-wrap gap-4"
                            triggerOnce={false}
                        >
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
                        </StaggeredList>
                    </div>
                </AnimatedSection>

                {/* Image half with animations */}
                <AnimatedSection
                    variants={slideInRight}
                    className="relative w-full md:w-1/2 min-h-[50vh] md:min-h-[70vh] lg:min-h-[90vh] flex items-center justify-center"
                    triggerOnce={true}
                    threshold={0.2}
                >
                    <div className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-6">
                        {/* First App Image with float animation */}
                        <AnimatedSection
                            variants={slideInRight}
                            triggerOnce={false}
                            delay={0.4}
                            
                        >
                            <img
                                src={app}
                                className="max-w-[80%] sm:max-w-[60%] md:max-w-xs h-auto object-contain"
                                alt="Mobile App Screenshot"
                            />
                        </AnimatedSection>
                        
                        {/* Second App Image with opposite float animation */}
                        <AnimatedSection
                            variants={slideInLeft}
                            triggerOnce={false}
                            delay={0.7}

                        >
                            <img
                                src={app2}
                                className="hidden lg:block max-w-[80%] sm:max-w-[60%] md:max-w-xs h-auto object-contain"
                                alt="Mobile App Screenshot 2"
                            />
                        </AnimatedSection>
                    </div>
                </AnimatedSection>
            </div>
        </section>
    );
}

export default AnimatedCTOSection;