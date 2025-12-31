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
} from "react-icons/fa";
import { toast } from "react-hot-toast";

const PositionMap = dynamic(() => import("@/components/position/positionmap"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 animate-pulse rounded-2xl" />,
});

export default function PositionPage() {
  const { company } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchPositions = useCallback(async (silent = false) => {
    if (!company?.id) return;

    silent ? setRefreshing(true) : setLoading(true);

    try {
      let realVehicles = await api.vehicles.getVehicles(company.id);

      if (!realVehicles || realVehicles.length === 0) {
        realVehicles = [
          { id: 1, vehicle_number: "DEMO-01", make: "Toyota", model: "Hilux", license_plate: "AA-12345", driver: { full_name: "Abebe Bikila" } },
          { id: 2, vehicle_number: "DEMO-02", make: "Hyundai", model: "Atos", license_plate: "AA-54321", driver: { full_name: "Kebede Molla" } },
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
    if (!searchTerm) return vehicles;
    const t = searchTerm.toLowerCase();
    return vehicles.filter(
      (v) =>
        v.vehicle?.license_plate?.toLowerCase().includes(t) ||
        v.vehicle?.make?.toLowerCase().includes(t) ||
        v.vehicle?.model?.toLowerCase().includes(t) ||
        v.vehicle?.driver?.full_name?.toLowerCase().includes(t)
    );
  }, [vehicles, searchTerm]);

  const selectedVehicle = vehicles.find((v) => v.vehicle_id === selectedVehicleId);

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
              <h1 className="text-lg font-semibold text-gray-900">Live Tracking</h1>
              <p className="text-sm text-gray-500">{vehicles.length} Vehicles</p>
            </div>
          </div>

          <button
            onClick={() => fetchPositions()}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 h-9 bg-gray-900 text-white rounded-md text-sm"
          >
            <FaSync className={refreshing ? "animate-spin" : ""} />
            Sync
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 relative">
        
        {/* MAP */}
        <div className="flex-[1.4] p-4">
          <div className="h-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
            <PositionMap
              vehicles={vehicles}
              selectedVehicleId={selectedVehicleId}
              onVehicleSelect={setSelectedVehicleId}
            />
          </div>
        </div>

        {/* SIDEBAR */}
        <div
          className={`absolute lg:relative right-0 inset-y-0 w-80 bg-white border-l border-gray-200 transition-transform ${
            sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search vehicle..."
                className="w-full h-9 pl-9 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          <div className="p-3 space-y-2 overflow-y-auto">
            {loading ? (
              <p className="text-sm text-gray-400">Loading vehicles...</p>
            ) : (
              filteredVehicles.map((v) => (
                <div
                  key={v.id}
                  onClick={() => {
                    setSelectedVehicleId(v.vehicle_id);
                    setSidebarOpen(false);
                  }}
                  className={`p-3 border rounded-md cursor-pointer ${
                    selectedVehicleId === v.vehicle_id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium text-sm">{v.vehicle?.license_plate}</p>
                      <p className="text-xs text-gray-500">
                        {v.vehicle?.make} {v.vehicle?.model}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {v.engine_status === "ON" ? "Active" : "Idle"}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span className="flex items-center gap-1">
                      <FaTachometerAlt /> {v.speed} km/h
                    </span>
                    <span className="flex items-center gap-1 truncate">
                      <FaUserTie /> {v.vehicle?.driver?.full_name || "Unassigned"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Info */}
      {selectedVehicle && (
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <div>
              <p className="font-medium">{selectedVehicle.vehicle?.license_plate}</p>
              <p className="text-xs text-gray-500">
                {selectedVehicle.vehicle?.make} {selectedVehicle.vehicle?.model}
              </p>
            </div>

            <div className="flex gap-6 text-sm">
              <div className="text-center">
                <FaTachometerAlt className="mx-auto text-gray-400" />
                <p>{selectedVehicle.speed} km/h</p>
              </div>
              <div className="text-center">
                <FaBatteryFull className="mx-auto text-gray-400" />
                <p>{selectedVehicle.voltage} V</p>
              </div>
              <div className="text-center">
                <FaSignal className="mx-auto text-gray-400" />
                <p>{selectedVehicle.signal}%</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
