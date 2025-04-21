// src/components/HeroSection.jsx
import { ArrowRight, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Waves } from "@workspace/ui/components/ui/waves";
import { motion } from "framer-motion";

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

    // Variants for text animation
    const titleVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
                duration: 0.8,
                ease: "easeOut"
            }
        }
    };

    const subtitleVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
                duration: 0.8,
                delay: 0.4,
                ease: "easeOut"
            }
        }
    };

    const buttonContainerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delay: 0.8,
                staggerChildren: 0.2
            }
        }
    };

    const buttonVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { 
            opacity: 1, 
            scale: 1,
            transition: {
                duration: 0.5,
                type: "spring",
                stiffness: 100
            }
        },
        hover: {
            scale: 1.05,
            transition: {
                duration: 0.3,
                yoyo: Infinity,
                ease: "easeInOut"
            }
        }
    };


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

            {/* Content */}
            <motion.div 
                className="relative z-10 w-full px-4 mb-8 lg:mb-24"
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1 }
                }}
            >
                <motion.div 
                    className="mx-auto max-w-3xl text-center"
                    animate={{
                        y: 0, 
                        transition: {
                            from: -10, 
                            duration: 1.2,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut",
                            delay: 0.8
                        }
                    }}
                >
                    <motion.h1 
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6"
                        variants={titleVariants}
                    >
                        {title}
                    </motion.h1>
                    
                    <motion.p 
                        className="text-lg md:text-xl mb-8 md:mb-10 text-secondary-500 text-opacity-90"
                        variants={subtitleVariants}
                    >
                        {subtitle}
                    </motion.p>
                    
                    <motion.div 
                        className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6"
                        variants={buttonContainerVariants}
                    >
                        <motion.div
                            variants={buttonVariants}
                            whileHover="hover"
                        >
                            <Link
                                to={primaryBtnLink}
                                className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-3 rounded-lg font-medium hover:opacity-90 transition-all duration-300 flex items-center group justify-center"
                                aria-label={primaryBtnText}
                            >
                                {primaryBtnText}
                                <motion.div
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ 
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "easeInOut" 
                                    }}
                                >
                                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </motion.div>
                            </Link>
                        </motion.div>
                        
                        <motion.div
                            variants={buttonVariants}
                            whileHover="hover"
                        >
                            <Link
                                to={secondaryBtnLink}
                                className="border-2 border-current px-6 py-2 sm:px-8 sm:py-3 rounded-lg font-medium text-inherit hover:bg-primary-500 hover:text-white transition-all duration-300 flex items-center justify-center"
                                aria-label={secondaryBtnText}
                            >
                                {secondaryBtnText}
                                <motion.div
                                    animate={{ 
                                        x: [0, 3, 0],
                                        rotate: [0, 5, 0]
                                    }}
                                    transition={{ 
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut" 
                                    }}
                                >
                                    <ChevronRight className="ml-1 w-5 h-5" />
                                </motion.div>
                            </Link>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </motion.div>

            {/* Animated highlight effect */}
            <motion.div
                className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-10"
                animate={{
                    x: ['-100%', '100%'],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />
        </div>
    );
};

export default HeroSection;