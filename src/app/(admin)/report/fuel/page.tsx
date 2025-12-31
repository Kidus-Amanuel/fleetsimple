
"use client";

import React, { useState, useEffect } from "react";
import { api, FuelRecord } from "@/api";
import { Vehicle, Driver } from "@/api/types";
import { FaPlus, FaSearch, FaGasPump, FaMoneyBillWave, FaChartLine, FaFilter } from "react-icons/fa";
import AddEditFuelModal from "@/components/fuel/AddEditFuelModal";
import DeleteFuelModal from "@/components/fuel/DeleteFuelModal";
import { useAuth } from "@/context/AuthContext";

export default function FuelReport() {
  const { user, company } = useAuth();
  const [records, setRecords] = useState<FuelRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FuelRecord | null>(null);

  useEffect(() => {
    if (company?.id) {
      fetchData(company.id);
    }
  }, [company?.id]);

  const fetchData = async (companyId: number) => {
    try {
      setLoading(true);
      const [fetchedVehicles, fetchedDrivers, fetchedRecords] = await Promise.all([
        api.vehicles.getVehicles(companyId),
        api.drivers.getDrivers(companyId),
        api.fuel.getFuelRecords(companyId)
      ]);

      setVehicles(fetchedVehicles);
      setDrivers(fetchedDrivers);
      setRecords(fetchedRecords);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (recordData: Partial<FuelRecord>) => {
    if (!company?.id) return;

    try {
      if (selectedRecord) {
        // Edit mode
        const updated = await api.fuel.updateFuelRecord(selectedRecord.id, recordData);
        // Re-fetch or manually merge to update UI with nested joins
        // For simplicity/accuracy with joins, re-fetching one record or just doing a full refresh is safer, 
        // but let's try to manually attach for speed
        const updatedWithJoins = {
          ...updated,
          vehicle: vehicles.find(v => v.id === updated.vehicle_id),
          driver: drivers.find(d => d.id === updated.driver_id)
        };
        setRecords(prev => prev.map(r => r.id === updated.id ? updatedWithJoins as FuelRecord : r));
      } else {
        // Add mode
        const newRecord = await api.fuel.createFuelRecord({
          ...recordData,
          company_id: company.id
        } as any);

        const createdWithJoins = {
          ...newRecord,
          vehicle: vehicles.find(v => v.id === newRecord.vehicle_id),
          driver: drivers.find(d => d.id === newRecord.driver_id)
        };
        setRecords(prev => [createdWithJoins as FuelRecord, ...prev]);
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
      await api.fuel.deleteFuelRecord(selectedRecord.id);
      setRecords(prev => prev.filter(r => r.id !== selectedRecord.id));
      setIsDeleteOpen(false);
      setSelectedRecord(null);
    } catch (error) {
      console.error("Failed to delete record", error);
    }
  };

  // Stats
  const totalCost = records.reduce((sum, record) => sum + record.cost, 0);
  const totalQuantity = records.reduce((sum, record) => sum + record.quantity, 0);
  const avgCostPerLiter = totalQuantity > 0 ? totalCost / totalQuantity : 0;

  // Filtered Data
  const filteredRecords = records.filter(r => {
    const searchLower = searchTerm.toLowerCase();
    return (
      r.vehicle?.vehicle_number.toLowerCase().includes(searchLower) ||
      r.vehicle?.make.toLowerCase().includes(searchLower) ||
      (r.station_name && r.station_name.toLowerCase().includes(searchLower))
    );
  });

  if (!company) {
    return <div className="p-8 text-center text-gray-500">Loading company information...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Fuel Report</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track fuel consumption and costs</p>
        </div>
        <button
          onClick={() => { setSelectedRecord(null); setIsAddEditOpen(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <FaPlus /> Add Fuel Record
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Fuel Cost</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">${totalCost.toFixed(2)}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xl">
            <FaMoneyBillWave />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Quantity</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{totalQuantity.toFixed(1)} L</p>
          </div>
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 text-xl">
            <FaGasPump />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Cost/Liter</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">${avgCostPerLiter.toFixed(2)}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-xl">
            <FaChartLine />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by vehicle or gas station..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-900 dark:border-gray-600"
          />
        </div>
      </div>

      {/* Fuel List */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity (L)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mileage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Station</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">Loading records...</td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">No fuel records found.</td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(record.fuel_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {record.vehicle?.vehicle_number || "Unknown"}
                      <span className="block text-xs text-gray-500 font-normal">{record.vehicle?.make} {record.vehicle?.model}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {record.driver?.full_name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {record.quantity} L
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      ${record.cost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {record.mileage?.toLocaleString()} km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {record.station_name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
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

      <AddEditFuelModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        onSave={handleSave}
        initialData={selectedRecord}
        vehicles={vehicles}
        drivers={drivers}
      />

      <DeleteFuelModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
