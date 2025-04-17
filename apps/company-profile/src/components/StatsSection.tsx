import { useState, useEffect, ReactNode, FC } from 'react';
import {
  Sprout,
  MapPinned,
  Handshake,
  CheckCircle,
  LucideIcon
} from 'lucide-react';

interface StatItem {
  label: string;
  value: number;
  icon: LucideIcon;
  valueLabel?: string; // Tambahkan properti untuk label nilai
  className?: string; // Tambahkan properti untuk className
}

const stats: StatItem[] = [
  { label: 'Petani Terbantu', value: 12000, icon: Sprout, valueLabel: 'k' },
  { label: 'Lahan Terintegrasi', value: 4500, icon: MapPinned, valueLabel: ' ha' },
  { label: 'Mitra Korporat', value: 32, icon: Handshake, valueLabel: '' },
  { label: 'Proyek Sukses', value: 120, icon: CheckCircle, valueLabel: '%' },
];

// Simple animated counter hook
const useCounter = (end: number, duration = 2000): number => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.max(timestamp - (startTime || 0), 0);
      const percentage = Math.min(progress / duration, 1);
      setCount(Math.floor(percentage * end));
      
      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  
  return count;
};

interface InViewProps {
  children: (props: { ref: (node: HTMLDivElement | null) => void; isVisible: boolean }) => ReactNode;
  className?: string;
}

// Simple intersection observer component
const InView: FC<InViewProps> = ({ children, className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  
  useEffect(() => {
    if (!ref) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(ref);
    
    return () => {
      if (ref) observer.unobserve(ref);
    };
  }, [ref]);
  
  return <div className={className}>{children({ ref: setRef, isVisible })}</div>;
};

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  isVisible: boolean;
  index: number;
  valueLabel?: string;
  className?: string;
}

// Stats card component
const StatCard: FC<StatCardProps> = ({ 
  label, 
  value, 
  icon: Icon, 
  isVisible, 
  index, 
  valueLabel = '', 
  className = 'bg-primary-500' 
}) => {
  const count = isVisible ? useCounter(value) : 0;
  
  // Format nilai dengan label
  const formatValue = (val: number) => {
    if (valueLabel === 'k' && val >= 1000) {
      return `${(val / 1000).toFixed(val % 1000 !== 0 ? 1 : 0)}${valueLabel}`;
    }
    return `${val.toLocaleString()}${valueLabel}`;
  };
  
  return (
    <div
      className={`${className} backdrop-blur-sm border border-white/20 text-white p-6 rounded-2xl shadow-xl hover:scale-105 transition-transform duration-300 ${
        isVisible ? `animate-fade-in-${index}` : ''
      }`}
      style={{
        animation: isVisible ? `fadeIn 0.5s ease-out ${index * 0.2}s forwards` : 'none',
      }}
    >
      <Icon className="w-10 h-10 mx-auto mb-4 text-white/80" />
      <h3 className="text-4xl font-bold text-white">
        {formatValue(count)}
      </h3>
      <p className="mt-2 text-sm font-medium text-white/80">{label}</p>
    </div>
  );
};

interface StatsSectionProps {
  className?: string;
  stats?: StatItem[];
  gridClassName?: string;
}

export default function StatsSection({
  className = '',
  stats: customStats,
  gridClassName = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
}: StatsSectionProps) {
  const displayStats = customStats || stats;
  
  return (
    <section className={`bg-transparent ${className}`}>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(24px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-0 { animation: fadeIn 0.5s ease-out 0s forwards; }
          .animate-fade-in-1 { animation: fadeIn 0.5s ease-out 0.2s forwards; }
          .animate-fade-in-2 { animation: fadeIn 0.5s ease-out 0.4s forwards; }
          .animate-fade-in-3 { animation: fadeIn 0.5s ease-out 0.6s forwards; }
        `}
      </style>
      <div className="container mx-auto px-4 text-center">
        <InView className="px-4 lg:px-8">
          {({ ref, isVisible }) => (
            <div ref={ref} className={`grid ${gridClassName} gap-6 lg:gap-10`}>
              {displayStats.map((stat, index) => (
                <StatCard 
                  key={index} 
                  {...stat} 
                  isVisible={isVisible} 
                  index={index} 
                />
              ))}
            </div>
          )}
        </InView>
      </div>
    </section>
  );
}