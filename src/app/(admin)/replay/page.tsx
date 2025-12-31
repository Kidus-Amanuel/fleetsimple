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
  FaFastForward,
  FaFastBackward,
  FaStop,
  FaCalendarAlt,
  FaGasPump,
  FaExpandAlt,
  FaCompressAlt,
  FaFilter,
  FaRegClock,
  FaLocationArrow,
  FaRoad,
  FaSatellite,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const ReplayMap = dynamic(() => import("@/components/replay/ReplayMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gradient-to-br from-blue-50 to-gray-50 animate-pulse rounded-2xl flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 animate-pulse flex items-center justify-center">
          <FaRoute className="text-blue-400 text-2xl" />
        </div>
        <p className="text-gray-400 font-medium">Loading replay map...</p>
      </div>
    </div>
  ),
});

const speedOptions = [
  { value: 0.5, label: "0.5x" },
  { value: 1, label: "1x" },
  { value: 2, label: "2x" },
  { value: 5, label: "5x" },
  { value: 10, label: "10x" },
];

export default function ReplayPage() {
  const { company } = useAuth();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapType, setMapType] = useState<"road" | "satellite">("road");

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
  const [filterStatus, setFilterStatus] = useState<"all" | "moving" | "stopped">("all");

  const playbackRef = useRef<NodeJS.Timeout | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!company?.id) return;

    const fetchVehicles = async () => {
      try {
        let data = await api.vehicles.getVehicles(company.id);

        if (!data || data.length === 0) {
          data = [
            {
              id: 1,
              license_plate: "AA-12345",
              make: "Toyota",
              model: "Hilux",
              driver: { full_name: "Abebe Bikila" },
              status: "active"
            },
            {
              id: 2,
              license_plate: "AA-54321",
              make: "Hyundai",
              model: "Atos",
              driver: { full_name: "Kebede Molla" },
              status: "idle"
            },
          ];
        }

        setVehicles(data);
        if (!selectedVehicleId && data.length > 0) {
          setSelectedVehicleId(data[0].id);
        }
      } catch {
        toast.error("Failed to load vehicles");
      }
    };

    fetchVehicles();
  }, [company?.id, selectedVehicleId]);

  const filteredVehicles = useMemo(() => {
    let filtered = vehicles;

    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.license_plate?.toLowerCase().includes(t) ||
          v.make?.toLowerCase().includes(t) ||
          v.model?.toLowerCase().includes(t) ||
          v.driver?.full_name?.toLowerCase().includes(t)
      );
    }

    if (filterStatus === "moving") {
      filtered = filtered.filter(v => v.status === "active");
    } else if (filterStatus === "stopped") {
      filtered = filtered.filter(v => v.status === "idle");
    }

    return filtered;
  }, [vehicles, searchTerm, filterStatus]);

  const handleFetchTrack = async () => {
    if (!selectedVehicleId) {
      toast.error("Please select a vehicle");
      return;
    }

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
        toast("No track data found. Generating demo route.", {
          icon: "🔍",
          style: {
            background: '#EFF6FF',
            color: '#1E40AF',
          }
        });
        setTrackData(generateDummyTrack());
      } else {
        setTrackData(data);
        toast.success(`Loaded ${data.length} route points`, {
          style: {
            background: '#D1FAE5',
            color: '#065F46',
          }
        });
      }

      setSidebarOpen(false);
    } catch {
      toast.error("Failed to load route data");
    } finally {
      setLoading(false);
    }
  };

  const generateDummyTrack = () => {
    const points = [];
    const baseDate = new Date();
    for (let i = 0; i < 150; i++) {
      points.push({
        latitude: 9.01 + i * 0.0005,
        longitude: 38.74 + Math.sin(i / 10) * 0.015,
        speed: Math.floor(30 + Math.random() * 50),
        recorded_at: new Date(baseDate.getTime() - (150 - i) * 60000).toISOString(),
        fuel: (100 - i * 0.5).toFixed(1),
        engine_status: Math.random() > 0.3 ? "ON" : "OFF",
      });
    }
    return points;
  };

  useEffect(() => {
    if (!isPlaying) {
      if (playbackRef.current) {
        clearInterval(playbackRef.current);
      }
      return;
    }

    playbackRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= trackData.length - 1) {
          setIsPlaying(false);
          toast("Replay completed", {
            icon: "🎬",
            style: {
              background: '#DBEAFE',
              color: '#1E40AF',
            }
          });
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / playbackSpeed);

    return () => {
      if (playbackRef.current) clearInterval(playbackRef.current);
    };
  }, [isPlaying, playbackSpeed, trackData.length]);

  const handleFullscreen = () => {
    if (!document.fullscreenElement && mapContainerRef.current) {
      mapContainerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const currentPoint = trackData[currentIndex];
  const polylinePoints = trackData.map((p) => [p.latitude, p.longitude] as [number, number]);
  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getProgressPercentage = () => {
    return trackData.length > 0 ? ((currentIndex + 1) / trackData.length) * 100 : 0;
  };

  const calculateDuration = () => {
    if (trackData.length < 2) return "0 min";
    const start = new Date(trackData[0].recorded_at);
    const end = new Date(trackData[trackData.length - 1].recorded_at);
    const diffMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    return `${diffMinutes} min`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-white -mx-4 md:-mx-6 -my-4 md:-my-6">

      {/* Enhanced Blue Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-blue-100  backdrop-blur-sm p-4 shadow-sm"
      >
        <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden w-10 h-10 border border-blue-200 rounded-lg flex items-center justify-center hover:bg-blue-50 transition-colors"
            >
              {sidebarOpen ? <FaTimes className="text-blue-600" /> : <FaBars className="text-blue-600" />}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                <FaHistory className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Historical Trip Replay</h1>
                <p className="text-sm text-blue-600 flex items-center gap-2">
                  <FaRegClock className="text-blue-500" />
                  {trackData.length > 0 ? `${trackData.length} points • ${calculateDuration()}` : "Load historical route to replay"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {trackData.length > 0 && (
              <>
                <div className="flex border border-blue-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setMapType("road")}
                    className={`px-3 py-2 text-sm flex items-center gap-2 ${mapType === "road"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-600 hover:bg-blue-50"
                      }`}
                  >
                    <FaRoad />
                    Road
                  </button>
                  <button
                    onClick={() => setMapType("satellite")}
                    className={`px-3 py-2 text-sm flex items-center gap-2 ${mapType === "satellite"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-600 hover:bg-blue-50"
                      }`}
                  >
                    <FaSatellite />
                    Satellite
                  </button>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFullscreen}
                  className="w-10 h-10 border border-blue-200 rounded-lg flex items-center justify-center hover:bg-blue-50 transition-colors"
                >
                  {isFullscreen ? <FaCompressAlt className="text-blue-600" /> : <FaExpandAlt className="text-blue-600" />}
                </motion.button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex flex-1 relative overflow-hidden">

        {/* Map Container */}
        <div ref={mapContainerRef} className="flex-1 p-4">
          <div className="h-full rounded-2xl overflow-hidden border border-blue-100 shadow-lg bg-white relative">
            <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-blue-100">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                  <FaRoute className="text-white text-sm" />
                </div>
                <span>Route Replay</span>
              </h3>
              {currentPoint ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FaClock className="text-blue-500 text-sm" />
                    <p className="text-sm font-medium text-gray-700">{formatTime(currentPoint.recorded_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaTachometerAlt className="text-blue-500 text-sm" />
                    <p className="text-sm font-medium text-gray-700">{currentPoint.speed} km/h</p>
                  </div>
                  <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full inline-block">
                    Point {currentIndex + 1} of {trackData.length}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Select a route to begin</p>
              )}
            </div>

            {/* Map Type Indicator */}
            <div className="absolute top-4 right-4 z-10">
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-blue-100 shadow-sm">
                {mapType === "road" ? (
                  <>
                    <FaRoad className="text-blue-500" />
                    <span className="text-sm text-gray-700">Road View</span>
                  </>
                ) : (
                  <>
                    <FaSatellite className="text-blue-500" />
                    <span className="text-sm text-gray-700">Satellite View</span>
                  </>
                )}
              </div>
            </div>

            {trackData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-b from-white to-blue-50">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center mb-6 animate-pulse">
                  <FaRoute className="text-blue-400 text-4xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Journey Awaits</h3>
                <p className="text-gray-600 text-center max-w-md mb-8">
                  Select a vehicle and time range to replay historical journeys and analyze past routes
                </p>
                <div className="flex items-center gap-4 text-sm text-blue-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <span>Select Vehicle</span>
                  </div>
                  <div className="text-gray-300">→</div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <span>Choose Time Range</span>
                  </div>
                  <div className="text-gray-300">→</div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <span>Load & Replay</span>
                  </div>
                </div>
              </div>
            ) : (
              <ReplayMap
                polylinePoints={polylinePoints}
                currentPoint={currentPoint}
                mapType={mapType}
              />
            )}
          </div>
        </div>

        {/* Enhanced Sidebar with Blue Theme */}
        <AnimatePresence>
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: sidebarOpen ? 0 : "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute lg:relative right-0 inset-y-0 w-80 lg:w-96 bg-white border-l border-blue-100 shadow-xl lg:shadow-none z-20 lg:!transform-none h-full"
          >
            <div className="h-full flex flex-col">
              {/* Sidebar Header */}
              <div className="p-4 border-b border-blue-100 bg-gradient-to-b from-blue-50 to-white">
                <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                    <FaCalendarAlt className="text-white text-sm" />
                  </div>
                  <span>Route Configuration</span>
                </h2>

                {/* Search */}
                <div className="relative mb-4">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search vehicles..."
                    className="w-full h-10 pl-9 pr-4 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                  />
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-4">
                  {["all", "moving", "stopped"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setFilterStatus(filter as any)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === filter
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm"
                        : "text-gray-600 hover:bg-blue-50 border border-blue-200"
                        }`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vehicle List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                {filteredVehicles.map((v) => (
                  <motion.button
                    key={v.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedVehicleId(v.id)}
                    className={`w-full p-4 border rounded-xl text-left transition-all duration-200 group ${selectedVehicleId === v.id
                      ? "border-blue-500 bg-gradient-to-r from-blue-50 to-blue-25 shadow-md"
                      : "border-blue-100 hover:border-blue-300 hover:shadow-sm bg-white"
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedVehicleId === v.id
                        ? "bg-gradient-to-r from-blue-500 to-blue-600"
                        : "bg-blue-100 group-hover:bg-blue-200"
                        }`}>
                        <FaCar className={
                          selectedVehicleId === v.id
                            ? "text-white"
                            : "text-blue-600"
                        } />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 truncate">{v.license_plate}</p>
                            <p className="text-sm text-gray-600 truncate">
                              {v.make} {v.model}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${v.status === "active"
                            ? "bg-gradient-to-r from-green-100 to-green-50 text-green-700 border border-green-200"
                            : "bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 border border-amber-200"
                            }`}>
                            {v.status === "active" ? "Moving" : "Idle"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <FaUserTie className="text-blue-500 flex-shrink-0" />
                          <span className="truncate">{v.driver?.full_name || "Unassigned"}</span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Date Controls */}
              <div className="p-4 border-t border-blue-100 bg-white space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center">
                      <FaClock className="text-blue-600 text-xs" />
                    </div>
                    <span>Select Time Range</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-blue-600 mb-1 font-medium">Start</p>
                      <div className="relative">
                        <input
                          type="datetime-local"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full h-9 border border-blue-200 rounded-lg text-xs px-2 pl-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        />
                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-100 rounded-sm"></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 mb-1 font-medium">End</p>
                      <div className="relative">
                        <input
                          type="datetime-local"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full h-9 border border-blue-200 rounded-lg text-xs px-2 pl-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        />
                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-sm"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleFetchTrack}
                  disabled={loading || !selectedVehicleId}
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 hover:opacity-100 transition-opacity"></div>
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin z-10" />
                      <span className="z-10">Loading Route...</span>
                    </>
                  ) : (
                    <>
                      <FaRoute className="z-10" />
                      <span className="z-10">Load Historical Route</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Enhanced Playback Controls - Blue Theme */}
      <AnimatePresence>
        {trackData.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="p-4 border-t border-blue-100 bg-white/95 backdrop-blur-sm shadow-lg"
          >
            <div className="max-w-6xl mx-auto">
              {/* Top Row - Info & Speed */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                <div className="flex items-center gap-4">
                  {selectedVehicle && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                        <FaCar className="text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{selectedVehicle.license_plate}</p>
                        <p className="text-sm text-blue-600">{selectedVehicle.make} {selectedVehicle.model}</p>
                      </div>
                    </div>
                  )}

                  {currentPoint && (
                    <div className="hidden md:flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Speed</p>
                        <p className="text-lg font-bold text-gray-900 flex items-center gap-1">
                          <FaTachometerAlt className="text-blue-500" />
                          {currentPoint.speed} km/h
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Fuel</p>
                        <p className="text-lg font-bold text-gray-900 flex items-center gap-1">
                          <FaGasPump className="text-blue-500" />
                          {currentPoint.fuel}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Time</p>
                        <p className="text-lg font-bold text-gray-900">{formatTime(currentPoint.recorded_at)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="text-lg font-bold text-gray-900">{formatDate(currentPoint.recorded_at)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Speed Control */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 font-medium">Playback Speed:</span>
                  <div className="flex bg-blue-50 rounded-lg p-1 border border-blue-100">
                    {speedOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setPlaybackSpeed(option.value)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${playbackSpeed === option.value
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm"
                          : "text-gray-600 hover:bg-blue-100"
                          }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentIndex(0)}
                    className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center hover:bg-blue-100"
                  >
                    <FaFastBackward className="text-blue-600" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentIndex(Math.max(0, currentIndex - 10))}
                    className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center hover:bg-blue-100"
                  >
                    <FaRedo className="text-blue-600 rotate-180" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 hover:opacity-100 transition-opacity"></div>
                    <span className="relative z-10">
                      {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} className="ml-1" />}
                    </span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentIndex(Math.min(trackData.length - 1, currentIndex + 10))}
                    className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center hover:bg-blue-100"
                  >
                    <FaRedo className="text-blue-600" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentIndex(trackData.length - 1)}
                    className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center hover:bg-blue-100"
                  >
                    <FaFastForward className="text-blue-600" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentIndex(0);
                    }}
                    className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center hover:bg-blue-100 ml-2"
                  >
                    <FaStop className="text-blue-600" />
                  </motion.button>
                </div>

                {/* Progress Bar */}
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span className="font-medium text-blue-600">{formatTime(trackData[0]?.recorded_at || '')}</span>
                    <span className="font-bold text-gray-900">
                      Point {currentIndex + 1} of {trackData.length}
                    </span>
                    <span className="font-medium text-blue-600">{formatTime(trackData[trackData.length - 1]?.recorded_at || '')}</span>
                  </div>
                  <div className="relative">
                    <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${getProgressPercentage()}%` }}
                        transition={{ type: "spring", stiffness: 100 }}
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={trackData.length - 1}
                      value={currentIndex}
                      onChange={(e) => {
                        if (isPlaying) setIsPlaying(false);
                        setCurrentIndex(Number(e.target.value));
                      }}
                      className="absolute top-0 left-0 w-full h-3 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}