// src/components/ui/Section.tsx
import React, { ReactNode } from 'react';

interface SectionProps {
    children: ReactNode;
    className?: string;
    containerClass?: string;
}

export const Section = ({ 
    children, 
    className = '', 
    containerClass = 'container mx-auto px-4' 
}: SectionProps) => (
    <section className={`py-12 md:py-16 ${className}`}>
        <div className={containerClass}>
            {children}
        </div>
    </section>
);