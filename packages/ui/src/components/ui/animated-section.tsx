// src/components/ui/AnimatedSection.tsx
import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export const fadeInUp = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1]
        }
    }
};

export const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.6,
            delay: 0.2
        }
    }
};

interface AnimatedSectionProps {
    children: ReactNode;
    variants?: any;
    className?: string;
    triggerOnce?: boolean;
    threshold?: number;
    rootMargin?: string;
}

export const AnimatedSection = ({ 
    children, 
    variants = fadeInUp,
    className = '',
    triggerOnce = true,
    threshold = 0.05,
    rootMargin = '100px 0px'
}: AnimatedSectionProps) => {
    const [ref, inView] = useInView({
        triggerOnce,
        threshold,
        rootMargin,
    });

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={variants}
            className={className}
        >
            {children}
        </motion.div>
    );
};