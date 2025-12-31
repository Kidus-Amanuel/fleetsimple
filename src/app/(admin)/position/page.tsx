"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/api";
import {
  FaCar,
  FaSync,
  FaSearch,
  FaUserTie,
  FaBars,
  FaTimes,
  FaTachometerAlt,
  FaBatteryFull,
  FaSignal,
  FaLocationArrow,
  FaFilter,
  FaMapMarkerAlt,
  FaEye,
  FaRegClock,
  FaWifi,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const PositionMap = dynamic(() => import("@/components/position/positionmap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gradient-to-br from-gray-50 to-gray-100 animate-pulse rounded-2xl flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 animate-pulse" />
        <p className="text-gray-400 font-medium">Loading map...</p>
      </div>
    </div>
  ),
});

export default function PositionPage() {
  const { company } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "idle">("all");

  const fetchPositions = useCallback(async (silent = false) => {
    if (!company?.id) return;

    silent ? setRefreshing(true) : setLoading(true);

    try {
      let realVehicles = await api.vehicles.getVehicles(company.id);

      if (!realVehicles || realVehicles.length === 0) {
        realVehicles = [
          {
            id: 1,
            vehicle_number: "DEMO-01",
            make: "Toyota",
            model: "Hilux",
            license_plate: "AA-12345",
            driver: { full_name: "Abebe Bikila" },
            color: "#3B82F6"
          },
          {
            id: 2,
            vehicle_number: "DEMO-02",
            make: "Hyundai",
            model: "Atos",
            license_plate: "AA-54321",
            driver: { full_name: "Kebede Molla" },
            color: "#10B981"
          },
        ];
      }

      const positions = await api.tracking.getLatestPositions(company.id);

      const mapped = realVehicles.map((v: any) => {
        const p = positions.find((x) => x.vehicle_id === v.id);
        if (p) return { ...p, vehicle: v };

        return {
          id: `dummy-${v.id}`,
          vehicle_id: v.id,
          latitude: 9.03 + (Math.random() - 0.5) * 0.05,
          longitude: 38.74 + (Math.random() - 0.5) * 0.05,
          speed: Math.floor(Math.random() * 60),
          engine_status: Math.random() > 0.4 ? "ON" : "OFF",
          voltage: (12 + Math.random()).toFixed(1),
          signal: Math.floor(Math.random() * 100),
          vehicle: v,
          last_update: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        };
      });

      setVehicles(mapped);
      if (!selectedVehicleId && mapped.length > 0) {
        setSelectedVehicleId(mapped[0].vehicle_id);
      }
    } catch {
      toast.error("Failed to load tracking data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [company?.id, selectedVehicleId]);

  useEffect(() => {
    if (!company?.id) return;
    fetchPositions();
    const i = setInterval(() => fetchPositions(true), 15000);
    return () => clearInterval(i);
  }, [company?.id, fetchPositions]);

  const filteredVehicles = useMemo(() => {
    let filtered = vehicles;

    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.vehicle?.license_plate?.toLowerCase().includes(t) ||
          v.vehicle?.make?.toLowerCase().includes(t) ||
          v.vehicle?.model?.toLowerCase().includes(t) ||
          v.vehicle?.driver?.full_name?.toLowerCase().includes(t)
      );
    }

    if (activeFilter === "active") {
      filtered = filtered.filter(v => v.engine_status === "ON");
    } else if (activeFilter === "idle") {
      filtered = filtered.filter(v => v.engine_status === "OFF");
    }

    return filtered;
  }, [vehicles, searchTerm, activeFilter]);

  const selectedVehicle = vehicles.find((v) => v.vehicle_id === selectedVehicleId);

  const getStatusColor = (status: string) => {
    return status === "ON" ? "bg-emerald-500" : "bg-amber-500";
  };

  const getSignalColor = (signal: number) => {
    if (signal > 70) return "text-emerald-600";
    if (signal > 40) return "text-amber-600";
    return "text-red-600";
  };

  const getBatteryColor = (voltage: string) => {
    const v = parseFloat(voltage);
    if (v > 12.5) return "text-emerald-600";
    if (v > 11.8) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 to-gray-100 -mx-4 md:-mx-6 -my-4 md:-my-6">

      {/* Enhanced Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-gray-200/50 bg-white/80 backdrop-blur-sm p-4 shadow-sm"
      >
        <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              {sidebarOpen ? <FaTimes className="text-gray-600" /> : <FaBars className="text-gray-600" />}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <FaCar className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Live Vehicle Tracking</h1>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-blue-500" />
                  {vehicles.length} vehicles • Real-time updates
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
              <FaRegClock className="text-blue-500" />
              <span>Auto-refresh: 15s</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchPositions()}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 h-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
            >
              <FaSync className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Syncing..." : "Sync Now"}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex flex-1 relative overflow-hidden">

        {/* Map Container with Enhanced Styling */}
        <div className="flex-[1.4] p-4">
          <div className="h-full rounded-2xl overflow-hidden border border-gray-200/50 shadow-lg bg-white relative">
            <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <FaEye className="text-blue-500" />
                Live Overview
              </h3>
              <p className="text-xs text-gray-500 mt-1">Click vehicles for details</p>
            </div>
            <PositionMap
              vehicles={vehicles}
              selectedVehicleId={selectedVehicleId}
              onVehicleSelect={setSelectedVehicleId}
            />
          </div>
        </div>

        {/* Enhanced Sidebar */}
        <AnimatePresence>
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: sidebarOpen ? 0 : "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute lg:relative right-0 inset-y-0 w-80 lg:w-96 bg-white border-l border-gray-200/50 shadow-xl lg:shadow-none z-20 lg:!transform-none h-full flex flex-col"
          >
            <div className="p-4 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-white">
              <div className="relative mb-3">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by plate, driver, or model..."
                  className="w-full h-10 pl-9 pr-4 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2">
                {["all", "active", "idle"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter as any)}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${activeFilter === filter
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 space-y-3 overflow-y-auto flex-1 min-h-0">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 border border-gray-200 rounded-xl animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))
              ) : filteredVehicles.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <FaCar className="text-gray-400" />
                  </div>
                  <p className="text-gray-500">No vehicles found</p>
                </div>
              ) : (
                filteredVehicles.map((v) => (
                  <motion.div
                    key={v.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => {
                      setSelectedVehicleId(v.vehicle_id);
                      setSidebarOpen(false);
                    }}
                    className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${selectedVehicleId === v.vehicle_id
                      ? "border-blue-500 bg-gradient-to-r from-blue-50 to-blue-25 shadow-md"
                      : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
                      }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(v.engine_status)}`} />
                          <p className="font-bold text-gray-900">{v.vehicle?.license_plate}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {v.vehicle?.vehicle_number}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {v.vehicle?.make} {v.vehicle?.model}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{v.speed} km/h</p>
                        <p className={`text-xs ${v.engine_status === "ON" ? "text-emerald-600" : "text-amber-600"}`}>
                          {v.engine_status === "ON" ? "Moving" : "Idle"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaUserTie className="text-blue-500" />
                        <span>{v.vehicle?.driver?.full_name || "No driver"}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <div className={`flex items-center gap-1 ${getBatteryColor(v.voltage)}`}>
                          <FaBatteryFull />
                          <span>{v.voltage}V</span>
                        </div>
                        <div className={`flex items-center gap-1 ${getSignalColor(v.signal)}`}>
                          <FaWifi />
                          <span>{v.signal}%</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Enhanced Bottom Info Panel */}
      <AnimatePresence>
        {selectedVehicle && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="p-4 border-t border-gray-200/50 bg-white/95 backdrop-blur-sm shadow-lg"
          >
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <FaCar className="text-white text-xl" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-gray-900">{selectedVehicle.vehicle?.license_plate}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedVehicle.engine_status)} text-white`}>
                        {selectedVehicle.engine_status}
                      </span>
                    </div>
                    <p className="text-gray-600">
                      {selectedVehicle.vehicle?.make} {selectedVehicle.vehicle?.model} • {selectedVehicle.vehicle?.driver?.full_name || "Unassigned"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-6 md:gap-8">
                  <div className="text-center">
                    <div className="w-10 h-10 mx-auto rounded-full bg-blue-50 flex items-center justify-center mb-1">
                      <FaTachometerAlt className="text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-500">Speed</p>
                    <p className="font-bold text-lg text-gray-900">{selectedVehicle.speed} km/h</p>
                  </div>

                  <div className="text-center">
                    <div className="w-10 h-10 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-1">
                      <FaBatteryFull className={getBatteryColor(selectedVehicle.voltage)} />
                    </div>
                    <p className="text-sm text-gray-500">Battery</p>
                    <p className="font-bold text-lg text-gray-900">{selectedVehicle.voltage} V</p>
                  </div>

                  <div className="text-center">
                    <div className="w-10 h-10 mx-auto rounded-full bg-purple-50 flex items-center justify-center mb-1">
                      <FaSignal className={getSignalColor(selectedVehicle.signal)} />
                    </div>
                    <p className="text-sm text-gray-500">Signal</p>
                    <p className="font-bold text-lg text-gray-900">{selectedVehicle.signal}%</p>
                  </div>

                  <div className="text-center">
                    <div className="w-10 h-10 mx-auto rounded-full bg-amber-50 flex items-center justify-center mb-1">
                      <FaLocationArrow className="text-amber-600" />
                    </div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-bold text-lg text-gray-900">Live</p>
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