
"use client";

import React, { useState, useEffect } from "react";
import { api, MaintenanceRecord } from "@/api";
import { Vehicle } from "@/api/types";
import { FaPlus, FaSearch, FaWrench, FaCheckCircle, FaMoneyBillWave, FaClock, FaFilter } from "react-icons/fa";
import AddEditMaintenanceModal from "@/components/maintenance/AddEditMaintenanceModal";
import DeleteMaintenanceModal from "@/components/maintenance/DeleteMaintenanceModal";
import { useAuth } from "@/context/AuthContext";

export default function MaintenancePage() {
  const { user, company } = useAuth();
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);

  useEffect(() => {
    if (company?.id) {
      fetchData(company.id);
    }
  }, [company?.id]);

  const fetchData = async (companyId: number) => {
    try {
      setLoading(true);
      const [fetchedVehicles, fetchedRecords] = await Promise.all([
        api.vehicles.getVehicles(companyId),
        api.maintenance.getMaintenanceRecords(companyId)
      ]);

      setVehicles(fetchedVehicles);
      setRecords(fetchedRecords);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (recordData: Partial<MaintenanceRecord>) => {
    if (!company?.id) return;

    try {
      if (selectedRecord) {
        // Edit mode
        const updated = await api.maintenance.updateMaintenanceRecord(selectedRecord.id, recordData);
        setRecords(prev => prev.map(r => r.id === updated.id ? { ...updated, vehicle: vehicles.find(v => v.id === updated.vehicle_id) } : r));
      } else {
        // Add mode
        const newRecord = await api.maintenance.createMaintenanceRecord({
          ...recordData,
          company_id: company.id
        } as any);
        // Manually attach vehicle for display
        const createdWithVehicle = {
          ...newRecord,
          vehicle: vehicles.find(v => v.id === newRecord.vehicle_id)
        };
        setRecords(prev => [createdWithVehicle as MaintenanceRecord, ...prev]);
      }
      setIsAddEditOpen(false);
      setSelectedRecord(null);
    } catch (error) {
      console.error("Failed to save record", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedRecord) return;
    try {
      await api.maintenance.deleteMaintenanceRecord(selectedRecord.id);
      setRecords(prev => prev.filter(r => r.id !== selectedRecord.id));
      setIsDeleteOpen(false);
      setSelectedRecord(null);
    } catch (error) {
      console.error("Failed to delete record", error);
    }
  };

  const handleComplete = async (record: MaintenanceRecord) => {
    try {
      const updated = await api.maintenance.updateMaintenanceRecord(record.id, { status: "completed" });
      setRecords(prev => prev.map(r => r.id === updated.id ? { ...updated, vehicle: vehicles.find(v => v.id === updated.vehicle_id) } : r));
    } catch (error) {
      console.error("Failed to complete record", error);
    }
  };

  // Filtered Data
  const filteredRecords = records.filter(r => {
    const matchesSearch =
      r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.vehicle?.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.vehicle?.make.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || r.service_type === filterType;

    return matchesSearch && matchesType;
  });

  // Stats
  const upcomingCount = records.filter(r => r.status === 'scheduled').length;
  const completedMonthCount = records.filter(r =>
    r.status === 'completed' &&
    new Date(r.service_date).getMonth() === new Date().getMonth()
  ).length;
  const monthCost = records
    .filter(r => new Date(r.service_date).getMonth() === new Date().getMonth())
    .reduce((sum, r) => sum + (r.cost || 0), 0);

  if (!company) {
    return <div className="p-8 text-center text-gray-500">Loading company information...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Maintenance</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track and schedule vehicle maintenance</p>
        </div>
        <button
          onClick={() => { setSelectedRecord(null); setIsAddEditOpen(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <FaPlus /> Schedule Maintenance
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Scheduled</p>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">{upcomingCount}</p>
          </div>
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600 text-xl">
            <FaClock />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed (Month)</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{completedMonthCount}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-xl">
            <FaCheckCircle />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Cost (Month)</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">${monthCost.toFixed(2)}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xl">
            <FaMoneyBillWave />
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by vehicle or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-900 dark:border-gray-600"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {["all", "routine", "repair", "inspection", "emergency"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors border ${filterType === type
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Maintenance List */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">Loading records...</td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No maintenance records found.</td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(record.service_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {record.vehicle?.vehicle_number || "Unknown"}
                      <span className="block text-xs text-gray-500 font-normal">{record.vehicle?.make} {record.vehicle?.model}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${record.service_type === 'routine' ? 'bg-blue-100 text-blue-700' :
                          record.service_type === 'repair' ? 'bg-red-100 text-red-700' :
                            'bg-green-100 text-green-700'
                        }`}>
                        {record.service_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                      {record.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      ${record.cost?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${record.status === 'completed' ? 'bg-green-100 text-green-700' :
                          record.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                        }`}>
                        {record.status === 'completed' ? 'Completed' :
                          record.status === 'in_progress' ? 'In Progress' : 'Scheduled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {record.status !== 'completed' && (
                        <button
                          onClick={() => handleComplete(record)}
                          className="text-green-600 hover:text-green-700 mr-3 font-medium"
                        >
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => { setSelectedRecord(record); setIsAddEditOpen(true); }}
                        className="text-blue-600 hover:text-blue-700 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => { setSelectedRecord(record); setIsDeleteOpen(true); }}
                        className="text-red-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddEditMaintenanceModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        onSave={handleSave}
        initialData={selectedRecord}
        vehicles={vehicles}
      />

      <DeleteMaintenanceModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
