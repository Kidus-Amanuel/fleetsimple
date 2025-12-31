"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/api";
import { FaPlus, FaSearch, FaFileExport, FaEdit, FaTrash, FaUser, FaPhone, FaIdCard, FaStar } from "react-icons/fa";
import AddEditDriverModal from "@/components/drivers/AddEditDriverModal";
import DeleteDriverModal from "@/components/drivers/DeleteDriverModal";
import { toast } from "react-hot-toast";

export default function DriversPage() {
  const { company } = useAuth();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal States
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [driverToEdit, setDriverToEdit] = useState<any | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<any | null>(null);

  useEffect(() => {
    fetchDrivers();
  }, [company?.id]);

  const fetchDrivers = async () => {
    if (!company?.id) return;
    setLoading(true);
    try {
      const data = await api.drivers.getDrivers(company.id);
      setDrivers(data || []);
    } catch (error) {
      console.error("Failed to load drivers", error);
      toast.error("Failed to load drivers");
    } finally {
      setLoading(false);
    }
  };

  const filteredDrivers = useMemo(() => {
    if (!searchTerm) return drivers;
    const lower = searchTerm.toLowerCase();
    return drivers.filter(d =>
      d.full_name?.toLowerCase().includes(lower) ||
      d.email?.toLowerCase().includes(lower) ||
      d.license_number?.toLowerCase().includes(lower) ||
      d.phone?.toLowerCase().includes(lower)
    );
  }, [drivers, searchTerm]);

  const handleExport = () => {
    // Basic CSV Export
    const headers = ["Full Name", "Email", "Phone", "License Number", "Status", "Total Trips", "Rating"];
    const rows = filteredDrivers.map(d => [
      d.full_name,
      d.email,
      d.phone,
      d.license_number,
      d.status,
      d.total_trips,
      d.rating
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "drivers_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openAddModal = () => {
    setDriverToEdit(null);
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (driver: any) => {
    setDriverToEdit(driver);
    setIsAddEditModalOpen(true);
  };

  const openDeleteModal = (driver: any) => {
    setDriverToDelete(driver);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Drivers Management</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your fleet drivers and their information</p>
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
            <FaPlus /> Add Driver
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, license, email..."
          className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Drivers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl"></div>
          ))
        ) : filteredDrivers.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No drivers found matching your search.
          </div>
        ) : (
          filteredDrivers.map(driver => (
            <div key={driver.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <FaUser className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{driver.full_name}</h3>
                    <div className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${driver.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        driver.status === 'on_leave' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                      {driver.status?.replace('_', ' ')}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(driver)}
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => openDeleteModal(driver)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <FaIdCard className="text-gray-400" />
                  <span>{driver.license_number}</span>
                </div>
                {driver.phone && (
                  <div className="flex items-center gap-2">
                    <FaPhone className="text-gray-400" />
                    <span>{driver.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FaStar className="text-yellow-400" />
                  <span>{driver.rating || 'N/A'} Rating</span>
                  <span className="text-gray-300">|</span>
                  <span>{driver.total_trips || 0} Trips</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <AddEditDriverModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSuccess={fetchDrivers}
        driverToEdit={driverToEdit}
      />

      <DeleteDriverModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={fetchDrivers}
        driverId={driverToDelete?.id}
        driverName={driverToDelete?.full_name || 'this driver'}
      />
    </div>
  );
}
