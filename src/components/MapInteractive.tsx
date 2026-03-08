'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Mark } from '@/types';

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
    onAddMark: (lat: number, lng: number) => void;
}

function LocationEvents({ onAddMark, centerLat, centerLng }: { onAddMark: (lat: number, lng: number) => void, centerLat?: number, centerLng?: number }) {
    const map = useMapEvents({
        click(e) {
            onAddMark(e.latlng.lat, e.latlng.lng);
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

export default function MapInteractive({ marks, onAddMark }: MapInteractiveProps) {
    const defaultCenter: [number, number] = marks.length > 0 ? [marks[0].lat, marks[0].lng] : [46.603354, 1.888334];

    // Create polyline positions
    const polylinePositions = marks.map((m) => [m.lat, m.lng] as [number, number]);

    return (
        <MapContainer
            center={defaultCenter}
            zoom={marks.length > 0 ? 11 : 5}
            scrollWheelZoom={true}
            className="h-[400px] w-full rounded-xl z-0"
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
        </MapContainer>
    );
}
