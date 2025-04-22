import { useEffect, useRef } from 'react';
import { Section } from '@workspace/ui/components/ui/section';
import { ArrowRight, Target, Eye, Award } from 'lucide-react';

interface Values {
    title: string;
    description: string;
    icon?: string; // Optional icon name
}

interface MissionVisionSectionProps {
    mission: string;
    vision: string;
    values: Values[];
    accentColor?: string;
}

const MissionVisionSection = ({
    mission,
    vision,
    values,
    accentColor = '#15803d'
}: MissionVisionSectionProps) => {
    const valuesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const valueCards = entry.target.querySelectorAll('.value-card');
                    valueCards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('fade-in');
                        }, index * 150);
                    });
                }
            });
        }, { threshold: 0.1 });

        if (valuesRef.current) {
            observer.observe(valuesRef.current);
        }

        return () => {
            if (valuesRef.current) {
                observer.unobserve(valuesRef.current);
            }
        };
    }, []);

    const getIcon = (iconName?: string) => {
        switch (iconName) {
            case 'target':
                return <Target size={24} className="text-white" />;
            case 'eye':
                return <Eye size={24} className="text-white" />;
            case 'award':
                return <Award size={24} className="text-white" />;
            default:
                return <Award size={24} className="text-white" />;
        }
    };

    const accentStyle = { color: accentColor, borderColor: accentColor };
    const bgAccentStyle = { backgroundColor: accentColor };

    return (
        <Section className="px-4 md:px-8 lg:px-16 py-16 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Misi, Visi & Nilai</h2>
                    <div className="h-1 w-20 bg-green-500 mx-auto mt-4"></div>
                </div>

                <div className="grid md:grid-cols-2 gap-16 items-start">
                    <div className="space-y-12">
                        <div className="bg-white p-8 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 border-t-4" style={{ borderColor: accentColor }}>
                            <div className="flex items-center mb-6">
                                <div className="p-3 rounded-full mr-4" style={bgAccentStyle}>
                                    <Target size={24} className="text-white" />
                                </div>
                                <h3 className="text-2xl font-bold" style={accentStyle}>Misi Kami</h3>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{mission}</p>
                            <div className="mt-6 flex items-center justify-end text-sm font-medium" style={accentStyle}>
                                <span>Pelajari lebih lanjut</span>
                                <ArrowRight size={16} className="ml-2" />
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 border-t-4" style={{ borderColor: accentColor }}>
                            <div className="flex items-center mb-6">
                                <div className="p-3 rounded-full mr-4" style={bgAccentStyle}>
                                    <Eye size={24} className="text-white" />
                                </div>
                                <h3 className="text-2xl font-bold" style={accentStyle}>Visi Kami</h3>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{vision}</p>
                            <div className="mt-6 flex items-center justify-end text-sm font-medium" style={accentStyle}>
                                <span>Pelajari lebih lanjut</span>
                                <ArrowRight size={16} className="ml-2" />
                            </div>
                        </div>
                    </div>

                    <div ref={valuesRef}>
                        <div className="p-8 mb-8 relative overflow-hidden">
                            <h2 className="text-3xl font-bold mb-8 relative z-10">Nilai-Nilai Kami</h2>
                            <div className="space-y-4">
                                {values.map((value, index) => (
                                    <div
                                        key={index}
                                        className="value-card opacity-0 p-6 bg-white rounded-lg border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden flex"
                                        style={{
                                            transform: 'translateY(20px)',
                                            transition: 'opacity 0.5s ease, transform 0.5s ease'
                                        }}
                                    >
                                        <div className="flex-shrink-0 mr-4">
                                            <div className="p-3 rounded-lg" style={bgAccentStyle}>
                                                {getIcon(value.icon)}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                                            <p className="text-gray-600">{value.description}</p>
                                        </div>
                                        <div
                                            className="absolute bottom-0 right-0 w-16 h-16 rounded-tl-lg opacity-5"
                                            style={bgAccentStyle}
                                        ></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        .fade-in {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
        </Section>
    );
};

export default MissionVisionSection;