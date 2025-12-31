"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/api";
import { FaPlus, FaSearch, FaFileExport, FaEdit, FaTrash, FaUser, FaPhone, FaIdCard, FaStar } from "react-icons/fa";
import AddEditDriverModal from "@/components/drivers/AddEditDriverModal";
import DeleteDriverModal from "@/components/drivers/DeleteDriverModal";
import { toast } from "react-hot-toast";

export default function DriversPage() {
  const { company, loading: authLoading } = useAuth();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal States
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [driverToEdit, setDriverToEdit] = useState<any | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<any | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (company?.id) {
        fetchDrivers();
      } else {
        setLoading(false); // Stop loading if no company (should redirect, but just in case)
      }
    }
  }, [company?.id, authLoading]);

  const fetchDrivers = async () => {
    if (!company?.id) return;
    console.log("Fetching drivers for company:", company.id);
    setLoading(true);
    try {
      const data = await api.drivers.getDrivers(company.id);
      console.log("Drivers data:", data);
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
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">License</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Performance</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mx-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No drivers found matching your search.
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                          <FaUser className="text-sm" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{driver.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-sm text-gray-500 dark:text-gray-400">
                        <span>{driver.email}</span>
                        {driver.phone && (
                          <span className="flex items-center gap-1 text-xs mt-0.5">
                            <FaPhone className="text-[10px]" /> {driver.phone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <FaIdCard className="text-gray-400" />
                        <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs">
                          {driver.license_number}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${driver.status === 'active'
                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                        : driver.status === 'on_leave'
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
                          : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                        }`}>
                        {driver.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center text-sm font-semibold text-gray-900 dark:text-white">
                          {driver.rating || 'N/A'} <FaStar className="text-yellow-400 ml-1 text-xs" />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-500">{driver.total_trips || 0} trips</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(driver)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => openDeleteModal(driver)}
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
