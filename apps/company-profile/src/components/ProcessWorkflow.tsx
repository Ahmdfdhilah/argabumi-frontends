// src/components/ProcessWorkflow.Tsx
import { useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { Coffee, Truck, Factory, ShoppingBag, Users, Award } from 'lucide-react';

// Mock data untuk proses kerja
export const processSteps = [
    {
        id: 1,
        title: "Budidaya Kebun",
        description: "Bekerja sama dengan petani terpilih yang menerapkan praktik pertanian berkelanjutan untuk menghasilkan biji kopi berkualitas tinggi.",
        icon: <Users className="w-8 h-8 md:w-10 md:h-10" />,
        bgColor: "bg-primary-100",
        iconColor: "text-primary-600"
    },
    {
        id: 2,
        title: "Panen Selektif",
        description: "Hanya biji kopi yang matang sempurna yang dipetik secara manual untuk memastikan kualitas terbaik.",
        icon: <Coffee className="w-8 h-8 md:w-10 md:h-10" />,
        bgColor: "bg-accent",
        iconColor: "text-primary-700"
    },
    {
        id: 3,
        title: "Pengolahan Premium",
        description: "Biji kopi diolah dengan metode terbaik (honey, natural, atau washed) untuk mengembangkan profil rasa yang unik.",
        icon: <Factory className="w-8 h-8 md:w-10 md:h-10" />,
        bgColor: "bg-primary-100",
        iconColor: "text-primary-600"
    },
    {
        id: 4,
        title: "Penjaminan Mutu",
        description: "Setiap batch melewati proses cupping dan quality control ketat untuk memastikan konsistensi dan keunggulan.",
        icon: <Award className="w-8 h-8 md:w-10 md:h-10" />,
        bgColor: "bg-accent",
        iconColor: "text-primary-700"
    },
    {
        id: 5,
        title: "Distribusi Cepat",
        description: "Sistem logistik terintegrasi memastikan pengiriman tepat waktu dengan kondisi optimal ke berbagai tujuan.",
        icon: <Truck className="w-8 h-8 md:w-10 md:h-10" />,
        bgColor: "bg-primary-100",
        iconColor: "text-primary-600"
    },
    {
        id: 6,
        title: "Sampai ke Konsumen",
        description: "Dari petani hingga cangkir Anda, kopi kami membawa manfaat untuk semua pihak dalam rantai nilai.",
        icon: <ShoppingBag className="w-8 h-8 md:w-10 md:h-10" />,
        bgColor: "bg-accent",
        iconColor: "text-primary-700"
    }
];

interface ProcessStepProps {
    step: typeof processSteps[number];
    index: number;
    isInView: boolean;
}

// Komponen untuk tiap langkah proses
const ProcessStep = ({ step, index, isInView }: ProcessStepProps) => {
    const isEven = index % 2 === 0;

    const variants = {
        hidden: { opacity: 0, y: 50 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.2,
                duration: 0.5,
                ease: "easeOut"
            }
        })
    };

    return (
        <motion.div
            className={`relative flex items-center ${isEven ? 'justify-start' : 'justify-end'} w-full mb-8`}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            custom={index}
            variants={variants}
        >
            {/* Connecting line */}
            <div className="hidden md:block absolute inset-0 flex items-center justify-center">
                <div className="h-1 w-full bg-primary-600"></div>
            </div>

            {/* Process step card */}
            <div className={`relative ${step.bgColor} rounded-lg shadow-lg p-4 md:p-6 w-full max-w-md z-10 border-l-4 border-primary-600`}>
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${step.bgColor} ${step.iconColor} shadow-md`}>
                        {step.icon}
                    </div>

                    <div className="flex-1">
                        <h3 className="text-lg md:text-xl font-bold text-primary-700 mb-2">{step.title}</h3>
                        <p className="text-sm md:text-base text-gray-700">{step.description}</p>
                    </div>

                    <div className="hidden md:flex h-12 w-12 rounded-full bg-primary-600 text-white items-center justify-center font-bold text-xl">
                        {step.id}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};


const ProcessWorkflow = () => {
    const controls = useAnimation();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, amount: 0.2 });

    useEffect(() => {
        if (isInView) {
            controls.start("visible");
        }
    }, [controls, isInView]);

    return (
        <div className="bg-gradient-to-b from-white to-accent py-16 md:py-24 px-4 relative overflow-hidden">

            <div className="container mx-auto max-w-5xl" ref={ref}>
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: -20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
                    transition={{ duration: 0.7 }}
                >
                    <div className="mb-4 text-center relative">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
                            <span className="inline-block mb-2">Dari Kebun ke Cangkir</span>
                            <div className="h-1 w-20 bg-primary-500 mx-auto"></div>
                        </h2>
                        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                            Perjalanan setiap biji kopi kami melalui proses yang didesain untuk memaksimalkan kualitas, keberlanjutan, dan manfaat bagi semua pihak.
                        </p>
                    </div>

                </motion.div>

                <div className="relative">

                    {/* Process steps container */}
                    <div className="relative z-10">
                        {processSteps.map((step, index) => (
                            <ProcessStep
                                key={step.id}
                                step={step}
                                index={index}
                                isInView={isInView}
                            />
                        ))}
                    </div>

                    {/* Journey line animation */}
                    <motion.div
                        className="hidden md:block absolute top-0 left-0 h-full w-1 bg-primary-600"
                        initial={{ height: 0 }}
                        animate={isInView ? { height: "100%" } : { height: 0 }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProcessWorkflow;