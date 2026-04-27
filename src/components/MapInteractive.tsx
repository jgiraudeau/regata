'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Mark, CurrentPoint, WindPoint } from '@/types';

// Fixation de l'icône par défaut de Leaflet avec webpack/nextjs
let DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapInteractiveProps {
    marks: Mark[];
    onAddMark?: (lat: number, lng: number) => void;
    currentPoints?: CurrentPoint[];
    windPoint?: WindPoint;
}

function LocationEvents({ onAddMark, centerLat, centerLng }: { onAddMark?: (lat: number, lng: number) => void, centerLat?: number, centerLng?: number }) {
    const map = useMapEvents({
        click(e) {
            if (onAddMark) {
                onAddMark(e.latlng.lat, e.latlng.lng);
            }
        },
    });

    // Si on change de lat/lng via l'UI (ex: preset dropdown)
    useEffect(() => {
        if (centerLat && centerLng) {
            const newPos = new L.LatLng(centerLat, centerLng);
            map.setView(newPos, map.getZoom() < 8 ? 10 : map.getZoom());
        }
    }, [centerLat, centerLng, map]);

    return null;
}

const createArrowIcon = (direction: number, color: string, scale: number = 1, isWind: boolean = false) => {
    // Les directions météo/courant indiquent souvent D'OÙ vient le vent, ou VERS OÙ va le courant.
    // Pour l'affichage, on pointe vers la destination. Le vent est donné en provenance, donc on ajoute 180°.
    // Les courants marins (SHOM) sont donnés dans la direction où ils VONT, donc on ne change rien.
    const displayDirection = isWind ? direction + 180 : direction;

    return L.divIcon({
        className: 'bg-transparent border-none',
        html: `<div style="transform: rotate(${displayDirection}deg) scale(${scale}); width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0px 0px 2px rgba(255,255,255,0.8));">
                <line x1="12" y1="19" x2="12" y2="5"></line>
                <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
        </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
};

const getCurrentColor = (speed: number) => {
    if (speed < 0.5) return '#3b82f6'; // blue-500
    if (speed < 1.5) return '#22c55e'; // green-500
    if (speed < 2.5) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
};

export default function MapInteractive({ marks, onAddMark, currentPoints, windPoint }: MapInteractiveProps) {
    const defaultCenter: [number, number] = marks.length > 0 ? [marks[0].lat, marks[0].lng] : [46.603354, 1.888334];

    // Create polyline positions
    const polylinePositions = marks.map((m) => [m.lat, m.lng] as [number, number]);

    return (
        <MapContainer
            center={defaultCenter}
            zoom={marks.length > 0 ? 11 : 5}
            scrollWheelZoom={true}
            className="h-full w-full rounded-xl z-0 min-h-[400px]"
        >
            <LayersControl position="topright">
                <LayersControl.BaseLayer checked name="OpenStreetMap (Terrestre)">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                </LayersControl.BaseLayer>

                <LayersControl.Overlay checked name="OpenSeaMap (Marin)">
                    <TileLayer
                        attribution='&copy; <a href="http://www.openseamap.org">OpenSeaMap</a>'
                        url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
                    />
                </LayersControl.Overlay>
            </LayersControl>

            <LocationEvents
                onAddMark={onAddMark}
                centerLat={marks.length > 0 ? marks[0].lat : undefined}
                centerLng={marks.length > 0 ? marks[0].lng : undefined}
            />

            {marks.map((mark, i) => (
                <Marker key={i} position={[mark.lat, mark.lng]}>
                    <Popup autoClose={false} closeOnClick={false}>
                        <div className="font-semibold text-sm">{mark.name}</div>
                        <div className="text-xs text-slate-500">
                            {mark.lat.toFixed(4)}, {mark.lng.toFixed(4)}
                        </div>
                    </Popup>
                </Marker>
            ))}

            {marks.length > 1 && (
                <Polyline positions={polylinePositions} color="#2563eb" weight={3} opacity={0.8} dashArray="5, 10" />
            )}

            {/* Vent global au centre de la zone */}
            {windPoint && (
                <Marker 
                    position={defaultCenter} 
                    icon={createArrowIcon(windPoint.direction, '#8b5cf6', 1.5, true)} // purple-500, larger
                    zIndexOffset={1000}
                >
                    <Popup>
                        <div className="text-sm font-semibold text-purple-700">Vent Prévu</div>
                        <div className="text-xs">{(windPoint.speed / 1.852).toFixed(1)} kts</div>
                        <div className="text-xs">{windPoint.direction}°</div>
                    </Popup>
                </Marker>
            )}

            {/* Grille de courants */}
            {currentPoints && currentPoints.map((cp, i) => (
                <Marker 
                    key={`current-${i}`} 
                    position={[cp.lat, cp.lng]} 
                    icon={createArrowIcon(cp.direction, getCurrentColor(cp.speed), 1.0, false)}
                    zIndexOffset={500}
                >
                    <Popup>
                        <div className="text-sm font-semibold">Courant</div>
                        <div className="text-xs">{cp.speed.toFixed(1)} kts</div>
                        <div className="text-xs">{cp.direction}°</div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
