"use client";
import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import ReactDOMServer from "react-dom/server";
import { FaCar, FaMapMarkerAlt, FaInfoCircle, FaPowerOff, FaSignal, FaBatteryFull, FaPlusCircle } from "react-icons/fa";
import "leaflet/dist/leaflet.css";

// Custom icon creator
const createVehicleIcon = (status: string, engineStatus: string, isSelected: boolean = false) => {
  const color = engineStatus === "ON" ? "#10b981" : "#94a3b8";
  
  return L.divIcon({
    html: ReactDOMServer.renderToString(
      <div className={`relative flex items-center justify-center transition-all duration-500 ${isSelected ? "scale-125 z-1000" : "scale-100"}`}>
        <div className="relative">
          <FaMapMarkerAlt className="h-12 w-12 drop-shadow-2xl" style={{ color }} />
          <div className="absolute top-[22%] left-1/2 -translate-x-1/2 bg-white rounded-full p-1 shadow-inner">
            <FaCar className="h-4 w-4" style={{ color }} />
          </div>
        </div>
        {engineStatus === "ON" && (
          <div className="absolute -inset-1 bg-emerald-500/20 rounded-full animate-ping" />
        )}
        {isSelected && (
          <div className="absolute -inset-3 border-2 border-brand-500/30 rounded-full animate-[spin_3s_linear_infinite]" />
        )}
      </div>
    ),
    className: "custom-vehicle-icon",
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48],
  });
};

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
      map.setView(center, Math.max(map.getZoom(), 14), {
        animate: true,
        duration: 1,
      });
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

interface PositionMapProps {
  vehicles: any[];
  selectedVehicleId: number | null;
  onVehicleSelect: (id: number) => void;
}

export default function PositionMap({ vehicles, selectedVehicleId, onVehicleSelect }: PositionMapProps) {
  const [mapReady, setMapReady] = useState(false);
  const [interestPoints, setInterestPoints] = useState<any[]>([]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setMapReady(true);
      window.dispatchEvent(new Event('resize'));
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const addInterestPoint = (lat: number, lng: number) => {
    setInterestPoints(prev => [...prev.slice(-4), { id: Date.now(), lat, lng }]);
  };

  if (!mapReady) return <div className="h-full w-full bg-gray-100 dark:bg-gray-800 animate-pulse" />;

  const selectedVehicle = vehicles.find(v => v.vehicle_id === selectedVehicleId);
  const center: [number, number] = selectedVehicle 
    ? [Number(selectedVehicle.latitude), Number(selectedVehicle.longitude)]
    : vehicles.length > 0 
      ? [Number(vehicles[0].latitude), Number(vehicles[0].longitude)]
      : [9.02, 38.75]; 

  return (
    <div className="h-full w-full relative group">
      <MapContainer
        center={center}
        zoom={12}
        className="h-full w-full z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={selectedVehicle ? [Number(selectedVehicle.latitude), Number(selectedVehicle.longitude)] : undefined} />
        <MapEvents onMapClick={addInterestPoint} />
        
        {vehicles.map((v) => (
          <Marker
            key={v.id}
            position={[Number(v.latitude), Number(v.longitude)]}
            icon={createVehicleIcon(v.vehicle?.status || "available", v.engine_status, selectedVehicleId === v.vehicle_id)}
            eventHandlers={{
              click: () => onVehicleSelect(v.vehicle_id),
            }}
          >
            <Popup className="custom-popup" minWidth={240}>
              <div className="p-4 bg-white dark:bg-gray-900 rounded-3xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
                    v.engine_status === 'ON' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500 dark:bg-white/10'
                  }`}>
                    <FaCar size={18} />
                  </div>
                  <div>
                    <p className="font-black text-gray-900 dark:text-white leading-tight">{v.vehicle?.vehicle_number}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{v.vehicle?.license_plate}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                    <FaPowerOff className={v.engine_status === 'ON' ? "text-emerald-500" : "text-gray-400"} size={10} />
                    <span className="text-[10px] font-black dark:text-gray-300 uppercase">IGN {v.engine_status}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                    <FaSignal className="text-blue-500" size={10} />
                    <span className="text-[10px] font-black dark:text-gray-300 uppercase">{v.signal}% Signal</span>
                  </div>
                </div>

                <div className="space-y-2 border-t pt-3 border-gray-100 dark:border-white/10">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-400 uppercase tracking-wider">Speed</span>
                    <span className="font-black text-emerald-600">{v.speed} km/h</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-400 uppercase tracking-wider">Battery</span>
                    <span className="font-black text-gray-700 dark:text-gray-200">{v.voltage}V</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Updated</span>
                    <span className="text-[10px] font-black text-gray-900 dark:text-white">
                      {new Date(v.recorded_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {interestPoints.map(p => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={createInterestIcon()}>
            <Popup>
              <div className="p-2 text-center">
                <p className="font-black text-gray-900 dark:text-white">Custom Point</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold mt-1">
                  LAT: {p.lat.toFixed(5)}<br/>LNG: {p.lng.toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Legend */}
      <div className="absolute top-6 left-6 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10">
        <h4 className="text-[10px] font-black uppercase text-gray-400 mb-3 px-1 tracking-[0.2em]">Fleet Map Status</h4>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 shadow-lg shadow-emerald-500/50" />
            <span className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Moving Now</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-slate-400 ring-4 ring-slate-400/20" />
            <span className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Parked / Offline</span>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-white/5">
             <p className="text-[8px] font-black text-brand-500 uppercase tracking-[0.2em]">Click map to add points</p>
          </div>
        </div>
      </div>
    </div>
  );
}
