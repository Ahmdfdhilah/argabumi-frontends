import { useState, useEffect } from 'react';

export default function Loader({ text = "Processing authentication..." }) {
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prevDots => {
                if (prevDots.length >= 3) return '';
                return prevDots + '.';
            });
        }, 500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="p-6">
                <div className="mb-4">
                    <div className="w-12 h-12 border-4 border-primary-500 dark:border-primary-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
                <div className="text-center">
                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                        {text}
                        <span className="inline-block w-6 text-left">{dots}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}