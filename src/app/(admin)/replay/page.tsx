"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { api } from "@/api";
import { useAuth } from "@/context/AuthContext";
import {
  FaPlay,
  FaPause,
  FaCar,
  FaHistory,
  FaTachometerAlt,
  FaMapMarkerAlt,
  FaRedo,
  FaRoute,
  FaClock,
  FaSearch,
  FaUserTie,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

const ReplayMap = dynamic(() => import("@/components/replay/ReplayMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 animate-pulse rounded-2xl" />
  ),
});

export default function ReplayPage() {
  const { company } = useAuth();

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });

  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d.toISOString().slice(0, 16);
  });

  const [trackData, setTrackData] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const playbackRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!company?.id) return;

    const fetchVehicles = async () => {
      let data = await api.vehicles.getVehicles(company.id);

      if (!data || data.length === 0) {
        data = [
          { id: 1, license_plate: "AA-12345", make: "Toyota", model: "Hilux", driver: { full_name: "Abebe Bikila" } },
          { id: 2, license_plate: "AA-54321", make: "Hyundai", model: "Atos", driver: { full_name: "Kebede Molla" } },
        ];
      }

      setVehicles(data);
      if (!selectedVehicleId && data.length > 0) {
        setSelectedVehicleId(data[0].id);
      }
    };

    fetchVehicles();
  }, [company?.id, selectedVehicleId]);

  const filteredVehicles = useMemo(() => {
    if (!searchTerm) return vehicles;
    const t = searchTerm.toLowerCase();
    return vehicles.filter(
      (v) =>
        v.license_plate?.toLowerCase().includes(t) ||
        v.make?.toLowerCase().includes(t) ||
        v.model?.toLowerCase().includes(t) ||
        v.driver?.full_name?.toLowerCase().includes(t)
    );
  }, [vehicles, searchTerm]);

  const handleFetchTrack = async () => {
    if (!selectedVehicleId) return;

    setLoading(true);
    setTrackData([]);
    setCurrentIndex(0);
    setIsPlaying(false);

    try {
      const data = await api.tracking.getVehicleTrack(
        selectedVehicleId,
        new Date(startDate).toISOString(),
        new Date(endDate).toISOString()
      );

      if (!data || data.length === 0) {
        toast("No track data. Using demo route.", { icon: "ℹ️" });
        setTrackData(generateDummyTrack());
      } else {
        setTrackData(data);
      }

      setSidebarOpen(false);
    } catch {
      toast.error("Failed to load route");
    } finally {
      setLoading(false);
    }
  };

  const generateDummyTrack = () => {
    const points = [];
    for (let i = 0; i < 100; i++) {
      points.push({
        latitude: 9.01 + i * 0.0005,
        longitude: 38.74 + Math.sin(i / 10) * 0.01,
        speed: Math.floor(30 + Math.random() * 40),
        recorded_at: new Date(Date.now() - (100 - i) * 60000).toISOString(),
        fuel: (100 - i * 0.5).toFixed(1),
      });
    }
    return points;
  };

  useEffect(() => {
    if (!isPlaying) return;

    playbackRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= trackData.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / playbackSpeed);

    return () => {
      if (playbackRef.current) clearInterval(playbackRef.current);
    };
  }, [isPlaying, playbackSpeed, trackData.length]);

  const currentPoint = trackData[currentIndex];
  const polylinePoints = trackData.map((p) => [p.latitude, p.longitude]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-white -mx-4 md:-mx-6 -my-4 md:-my-6">
      
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex justify-between items-center max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden w-9 h-9 border rounded-md flex items-center justify-center"
            >
              {sidebarOpen ? <FaTimes /> : <FaBars />}
            </button>
            <div>
              <h1 className="text-lg font-semibold">Trip Replay</h1>
              <p className="text-sm text-gray-500">Historical route playback</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-1 relative">
        
        {/* MAP */}
        <div className="flex-[1.4] p-4">
          <div className="h-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
            <ReplayMap
              polylinePoints={polylinePoints}
              currentPoint={currentPoint}
            />
          </div>
        </div>

        {/* SIDEBAR */}
        <div
          className={`absolute lg:relative right-0 inset-y-0 w-80 bg-white border-l border-gray-200 transition-transform ${
            sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="p-4 space-y-4 h-full flex flex-col">
            <h2 className="font-semibold flex items-center gap-2">
              <FaRoute /> Replay Setup
            </h2>

            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search vehicle"
                className="w-full h-9 pl-9 border rounded-md text-sm"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredVehicles.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVehicleId(v.id)}
                  className={`w-full p-3 border rounded-md text-left ${
                    selectedVehicleId === v.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <p className="text-sm font-medium">{v.license_plate}</p>
                  <p className="text-xs text-gray-500">
                    {v.make} {v.model}
                  </p>
                </button>
              ))}
            </div>

            <div className="space-y-3 pt-3 border-t">
              <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full h-9 border rounded-md text-sm px-2" />
              <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full h-9 border rounded-md text-sm px-2" />

              <button
                onClick={handleFetchTrack}
                disabled={loading}
                className="h-10 bg-gray-900 text-white rounded-md text-sm"
              >
                {loading ? "Loading..." : "Load Route"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Playback */}
      {trackData.length > 0 && (
        <div className="p-4 border-t bg-white">
          <div className="max-w-6xl mx-auto flex items-center gap-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center"
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>

            <input
              type="range"
              min={0}
              max={trackData.length - 1}
              value={currentIndex}
              onChange={(e) => {
                setIsPlaying(false);
                setCurrentIndex(Number(e.target.value));
              }}
              className="flex-1"
            />

            <span className="text-sm text-gray-500">
              {currentIndex + 1} / {trackData.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
