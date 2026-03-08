'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import type { Mark } from '@/types';

interface MapLoaderProps {
    marks: Mark[];
    onAddMark: (lat: number, lng: number) => void;
}

// Loader interactif sans SSR, indispensable pour utiliser window
const MapInteractive = dynamic(() => import('./MapInteractive'), {
    ssr: false,
    loading: () => (
        <div className="h-[400px] w-full rounded-xl bg-slate-100 animate-pulse flex items-center justify-center">
            <span className="text-slate-400">Chargement de la carte...</span>
        </div>
    ),
});

export default function MapLoader(props: MapLoaderProps) {
    return <MapInteractive {...props} />;
}
