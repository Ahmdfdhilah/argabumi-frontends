// src/pages/HomePage.jsx
import {  ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// Animation variants yang dioptimalkan
const fadeInUp = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1] // Kurva easing yang lebih smooth
        }
    }
};

// Loading fallback yang lebih ringan
export const LoadingFallback = () => (
    <div className="flex justify-center items-center py-12 min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
    </div>
);

// Komponen Section yang dioptimalkan
export const Section = ({ children, className = '' }: { children: ReactNode, className?: string }) => (
    <section className={`py-12 md:py-16 ${className}`}>
        <div className="container mx-auto px-4">
            {children}
        </div>
    </section>
);

// Animation wrapper yang dioptimalkan
export const AnimatedSection = ({ children, variants = fadeInUp }: { children: ReactNode, variants?: any }) => {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.05, // Threshold lebih rendah
        rootMargin: '100px 0px', // Memulai load lebih awal
    });

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={variants}
        >
            {children}
        </motion.div>
    );
};
