"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import ReactDOMServer from "react-dom/server";
import { FaMapMarkerAlt, FaCar, FaFlagCheckered, FaPlay, FaPlusCircle } from "react-icons/fa";
import "leaflet/dist/leaflet.css";

// Custom icon creator for the playback marker
const createPlaybackIcon = (color: string = '#4680FF', isCurrent: boolean = false) =>
  L.divIcon({
    html: ReactDOMServer.renderToString(
      <div className="relative">
        <FaMapMarkerAlt className={`h-12 w-12 drop-shadow-2xl ${isCurrent ? 'animate-bounce' : ''}`} style={{ color }} />
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 bg-white rounded-full p-1 shadow-inner">
           <FaCar className="h-4 w-4" style={{ color }} />
        </div>
        {isCurrent && (
          <div className="absolute -inset-2 rounded-full bg-blue-500/20 animate-ping" />
        )}
      </div>
    ),
    className: "custom-playback-icon",
    iconSize: [48, 48],
    iconAnchor: [24, 48],
  });

const createStartEndIcon = (type: 'start' | 'end') =>
  L.divIcon({
    html: ReactDOMServer.renderToString(
      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-4 border-white shadow-xl ${type === 'start' ? 'bg-emerald-500' : 'bg-gray-900'}`}>
        {type === 'start' ? <FaPlay className="text-white text-[10px] ml-0.5" /> : <FaFlagCheckered className="text-white text-[10px]" />}
      </div>
    ),
    className: "custom-point-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

const createInterestIcon = () => L.divIcon({
  html: ReactDOMServer.renderToString(
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-500 border-4 border-white shadow-xl animate-bounce">
      <FaPlusCircle className="text-white text-sm" />
    </div>
  ),
  className: "interest-icon",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function MapController({ center }: { center?: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom(), { animate: true, duration: 0.5 });
    }
  }, [center, map]);
  return null;
}

function MapEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface ReplayMapProps {
  polylinePoints: [number, number][];
  currentPoint: any;
}

export default function ReplayMap({ polylinePoints, currentPoint }: ReplayMapProps) {
  const [interestPoints, setInterestPoints] = useState<any[]>([]);

  // Trigger resize after mount to ensure leaflet fills container
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const addInterestPoint = (lat: number, lng: number) => {
    setInterestPoints(prev => [...prev.slice(-4), { id: Date.now(), lat, lng }]);
  };

  const center: [number, number] = currentPoint 
    ? [Number(currentPoint.latitude), Number(currentPoint.longitude)]
    : polylinePoints.length > 0 
      ? polylinePoints[0] 
      : [9.02, 38.75];

  return (
    <MapContainer
      center={center}
      zoom={14}
      className="h-full w-full z-0"
      zoomControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapController center={currentPoint ? [Number(currentPoint.latitude), Number(currentPoint.longitude)] : undefined} />
      <MapEvents onMapClick={addInterestPoint} />
      
      {polylinePoints.length > 0 && (
        <>
          <Polyline 
            positions={polylinePoints} 
            color="#4680FF" 
            weight={6} 
            opacity={0.4}
            lineCap="round"
          />
          <Polyline 
            positions={polylinePoints} 
            color="#4680FF" 
            weight={2} 
            opacity={1}
            dashArray="10, 10"
          />
          
          <Marker position={polylinePoints[0]} icon={createStartEndIcon('start')} />
          <Marker position={polylinePoints[polylinePoints.length - 1]} icon={createStartEndIcon('end')} />
        </>
      )}

      {currentPoint && (
        <Marker 
          position={[Number(currentPoint.latitude), Number(currentPoint.longitude)]}
          icon={createPlaybackIcon('#4680FF', true)}
        >
          <Popup className="custom-popup" minWidth={200}>
            <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Snapshot</p>
               <p className="font-black text-gray-900 dark:text-white mb-3 text-xs">
                 {new Date(currentPoint.recorded_at).toLocaleString()}
               </p>
               <div className="grid grid-cols-2 gap-4 border-t pt-3 border-gray-100 dark:border-white/10 text-xs">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Speed</p>
                    <p className="font-black text-brand-500">{currentPoint.speed} km/h</p>
                  </div>
                  {currentPoint.fuel && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Fuel</p>
                      <p className="font-black text-orange-500">{currentPoint.fuel}%</p>
                    </div>
                  )}
               </div>
            </div>
          </Popup>
        </Marker>
      )}

      {interestPoints.map(p => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={createInterestIcon()}>
          <Popup>
            <div className="p-2 text-center">
              <p className="font-black text-gray-900 dark:text-white">POI</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold mt-1">
                {p.lat.toFixed(5)}, {p.lng.toFixed(5)}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
