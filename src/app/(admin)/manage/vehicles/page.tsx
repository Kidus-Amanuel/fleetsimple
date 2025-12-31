"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/api";
import { FaPlus, FaSearch, FaFileExport, FaEdit, FaTrash, FaCar, FaGasPump, FaUser, FaTachometerAlt } from "react-icons/fa";
import AddEditVehicleModal from "@/components/vehicles/AddEditVehicleModal";
import DeleteVehicleModal from "@/components/vehicles/DeleteVehicleModal";
import { toast } from "react-hot-toast";

export default function VehiclesPage() {
  const { company, loading: authLoading } = useAuth();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal States
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<any | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<any | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (company?.id) {
        fetchVehicles();
      } else {
        setLoading(false);
      }
    }
  }, [company?.id, authLoading]);

  const fetchVehicles = async () => {
    if (!company?.id) return;
    console.log("Fetching vehicles for company:", company.id);
    setLoading(true);
    try {
      const data = await api.vehicles.getVehicles(company.id);
      console.log("Vehicles data:", data);
      setVehicles(data || []);
    } catch (error) {
      console.error("Failed to load vehicles", error);
      toast.error("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = useMemo(() => {
    if (!searchTerm) return vehicles;
    const lower = searchTerm.toLowerCase();
    return vehicles.filter(v =>
      v.vehicle_number?.toLowerCase().includes(lower) ||
      v.make?.toLowerCase().includes(lower) ||
      v.model?.toLowerCase().includes(lower) ||
      v.license_plate?.toLowerCase().includes(lower) ||
      v.driver?.full_name?.toLowerCase().includes(lower)
    );
  }, [vehicles, searchTerm]);

  const handleExport = () => {
    // Basic CSV Export
    const headers = ["Vehicle ID", "Make", "Model", "Year", "License Plate", "Fuel Type", "Current Miles", "Status", "Driver"];
    const rows = filteredVehicles.map(v => [
      v.vehicle_number,
      v.make,
      v.model,
      v.year,
      v.license_plate,
      v.fuel_type,
      v.current_mileage,
      v.status,
      v.driver?.full_name || "Unassigned"
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "vehicles_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openAddModal = () => {
    setVehicleToEdit(null);
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (vehicle: any) => {
    setVehicleToEdit(vehicle);
    setIsAddEditModalOpen(true);
  };

  const openDeleteModal = (vehicle: any) => {
    setVehicleToDelete(vehicle);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vehicles Management</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your fleet vehicles</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition"
          >
            <FaFileExport /> Export
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 flex items-center gap-2 transition"
          >
            <FaPlus /> Add Vehicle
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by ID, Make, Model, Plate, or Driver..."
          className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Vehicles List */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold">
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Identifiers</th>
                <th className="px-6 py-4">Fuel</th>
                <th className="px-6 py-4">Driver</th>
                <th className="px-6 py-4">Mileage</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No vehicles found matching your search.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400">
                          <FaCar className="text-xl" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{vehicle.make} {vehicle.model}</p>
                          <p className="text-xs text-gray-500">{vehicle.year}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded w-fit">
                          {vehicle.license_plate}
                        </span>
                        <span className="text-xs text-gray-500">ID: {vehicle.vehicle_number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                        <FaGasPump className="text-gray-400 text-xs" />
                        {vehicle.fuel_type}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <FaUser className="text-gray-400 text-xs" />
                        <span className={vehicle.driver?.full_name ? "text-gray-900 dark:text-white" : "text-gray-400 italic"}>
                          {vehicle.driver?.full_name || 'Unassigned'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <FaTachometerAlt className="text-gray-400 text-xs" />
                        {vehicle.current_mileage?.toLocaleString()} km
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${vehicle.status === 'available'
                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                        : vehicle.status === 'in_use'
                          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
                          : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                        }`}>
                        {vehicle.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(vehicle)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => openDeleteModal(vehicle)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddEditVehicleModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSuccess={fetchVehicles}
        vehicleToEdit={vehicleToEdit}
      />

      <DeleteVehicleModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={fetchVehicles}
        vehicleId={vehicleToDelete?.id}
        vehicleName={`${vehicleToDelete?.make} ${vehicleToDelete?.model} (${vehicleToDelete?.vehicle_number})`}
      />
    </div>
  );
}
