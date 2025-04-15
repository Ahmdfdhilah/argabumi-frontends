// src/components/ui/LoadingFallback.tsx
import React from 'react';

export const LoadingFallback = () => (
    <div className="flex justify-center items-center py-12 min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
    </div>
);