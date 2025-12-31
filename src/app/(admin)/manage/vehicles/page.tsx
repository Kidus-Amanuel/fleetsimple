"use client";

import React, { useState, useEffect, useMemo } from "react";
import { api } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { FaCar, FaPlus, FaSearch, FaEllipsisV, FaGasPump, FaWrench, FaCheckCircle, FaExclamationTriangle, FaTrash, FaEdit } from "react-icons/fa";
import { toast } from "react-hot-toast";

export default function ManageVehicles() {
  const { company } = useAuth();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    vehicle_number: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    license_plate: "",
    fuel_type: "petrol",
    status: "available",
    driver_id: ""
  });

  const fetchVehicles = useCallback(async () => {
    if (!company?.id) return;
    try {
      setLoading(true);
      const data = await api.vehicles.getVehicles(company.id);
      setVehicles(data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      toast.error("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  }, [company?.id]);

  const fetchDrivers = useCallback(async () => {
    if (!company?.id) return;
    try {
      const data = await api.drivers.getDrivers(company.id);
      setDrivers(data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  }, [company?.id]);

  useEffect(() => {
    fetchVehicles();
    fetchDrivers();
  }, [fetchVehicles, fetchDrivers]);

  const filteredVehicles = useMemo(() => {
    if (!searchTerm) return vehicles;
    const term = searchTerm.toLowerCase();
    return vehicles.filter(v => 
      v.vehicle_number?.toLowerCase().includes(term) ||
      v.license_plate?.toLowerCase().includes(term) ||
      v.model?.toLowerCase().includes(term) ||
      v.make?.toLowerCase().includes(term)
    );
  }, [vehicles, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company?.id) return;

    try {
      const payload = {
        ...formData,
        company_id: company.id,
        driver_id: formData.driver_id ? parseInt(formData.driver_id) : null,
        year: parseInt(formData.year.toString()),
        current_mileage: 0
      };

      await api.vehicles.createVehicle(payload as any);
      toast.success("Vehicle added successfully!");
      setIsModalOpen(false);
      setFormData({
        vehicle_number: "",
        make: "",
        model: "",
        year: new Date().getFullYear(),
        license_plate: "",
        fuel_type: "petrol",
        status: "available",
        driver_id: ""
      });
      fetchVehicles();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to add vehicle");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      await api.vehicles.deleteVehicle(id);
      toast.success("Vehicle deleted");
      fetchVehicles();
    } catch (error) {
      toast.error("Failed to delete vehicle");
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">Fleet Assets</h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold mt-1">Registry of all company vehicles and tracked units</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group flex-1 md:flex-none">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search assets..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-80 h-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl pl-12 pr-4 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-brand-500/10 transition-all"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-8 h-12 bg-brand-500 text-white rounded-2xl font-black hover:scale-105 transition-all shadow-xl shadow-brand-500/20 flex items-center gap-2 shrink-0"
          >
            <FaPlus /> Add Vehicle
          </button>
        </div>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Assets", value: vehicles.length, icon: FaCar, color: "bg-blue-500" },
          { label: "Available", value: vehicles.filter(v => v.status === "available").length, icon: FaCheckCircle, color: "bg-emerald-500" },
          { label: "In Service", value: vehicles.filter(v => v.status === "in_use").length, icon: FaGasPump, color: "bg-orange-500" },
          { label: "Maintenance", value: vehicles.filter(v => v.status === "maintenance").length, icon: FaWrench, color: "bg-red-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/5 p-6 rounded-4xl shadow-xl">
             <div className={`${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-${stat.color.split('-')[1]}-500/20`}>
                <stat.icon size={20} />
             </div>
             <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-1">{stat.label}</p>
             <p className="text-3xl font-black text-gray-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-64 rounded-4xl bg-gray-100 dark:bg-white/5 animate-pulse" />
          ))
        ) : filteredVehicles.length === 0 ? (
          <div className="col-span-full py-20 bg-white dark:bg-gray-900 rounded-4xl border-2 border-dashed border-gray-200 dark:border-white/5 flex flex-col items-center justify-center text-center">
             <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 mb-6">
                <FaCar size={32} />
             </div>
             <h3 className="text-xl font-black text-gray-900 dark:text-white">No Assets Registered</h3>
             <p className="text-gray-500 font-bold mt-2 mb-8">Start by adding your first company vehicle to the fleet.</p>
             <button 
               onClick={() => setIsModalOpen(true)}
               className="px-10 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black shadow-2xl hover:scale-105 transition-all"
             >
               Add First Vehicle
             </button>
          </div>
        ) : (
          filteredVehicles.map((v) => (
            <div key={v.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/5 rounded-4xl p-6 shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden">
               <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 rounded-3xl bg-brand-500/10 flex items-center justify-center text-brand-500">
                    <FaCar size={28} />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-brand-500 transition-colors">
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => handleDelete(v.id)}
                      className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
               </div>
               
               <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">{v.license_plate}</h3>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{v.make} {v.model} ({v.year})</p>
               </div>

               <div className="mt-8 flex items-center justify-between border-t border-gray-100 dark:border-white/5 pt-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      v.status === 'available' ? 'bg-emerald-100 text-emerald-700' :
                      v.status === 'in_use' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {v.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Driver</span>
                    <span className="text-sm font-black text-gray-900 dark:text-white">
                      {v.driver?.full_name || "Unassigned"}
                    </span>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white dark:bg-gray-900 w-full max-w-lg rounded-4xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
             <div className="p-8 border-b border-gray-100 dark:border-white/10">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">Add New Asset</h2>
                <p className="text-gray-500 font-bold mt-1">Register a new vehicle to your fleet registry</p>
             </div>
             
             <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                   <div className="col-span-1">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2 block">Vehicle ID</label>
                      <input 
                        type="text" 
                        required
                        placeholder="FLT-001"
                        value={formData.vehicle_number}
                        onChange={e => setFormData({...formData, vehicle_number: e.target.value})}
                        className="w-full h-12 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-brand-500/10"
                      />
                   </div>
                   <div className="col-span-1">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2 block">License Plate</label>
                      <input 
                        type="text" 
                        required
                        placeholder="AA-2-B12345"
                        value={formData.license_plate}
                        onChange={e => setFormData({...formData, license_plate: e.target.value})}
                        className="w-full h-12 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-brand-500/10"
                      />
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                   <div className="col-span-1">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2 block">Make</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Toyota"
                        value={formData.make}
                        onChange={e => setFormData({...formData, make: e.target.value})}
                        className="w-full h-12 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-brand-500/10"
                      />
                   </div>
                   <div className="col-span-1">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2 block">Model</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Hilux"
                        value={formData.model}
                        onChange={e => setFormData({...formData, model: e.target.value})}
                        className="w-full h-12 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-brand-500/10"
                      />
                   </div>
                   <div className="col-span-1">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2 block">Year</label>
                      <input 
                        type="number" 
                        required
                        value={formData.year}
                        onChange={e => setFormData({...formData, year: parseInt(e.target.value)})}
                        className="w-full h-12 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-brand-500/10"
                      />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2 block">Fuel Type</label>
                      <select 
                        value={formData.fuel_type}
                        onChange={e => setFormData({...formData, fuel_type: e.target.value})}
                        className="w-full h-12 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 text-sm font-bold dark:text-white outline-none"
                      >
                         <option value="petrol">Petrol</option>
                         <option value="diesel">Diesel</option>
                         <option value="electric">Electric</option>
                         <option value="hybrid">Hybrid</option>
                      </select>
                   </div>
                   <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2 block">Assigned Driver</label>
                      <select 
                        value={formData.driver_id}
                        onChange={e => setFormData({...formData, driver_id: e.target.value})}
                        className="w-full h-12 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 text-sm font-bold dark:text-white outline-none"
                      >
                         <option value="">No Driver Assigned</option>
                         {drivers.map(d => (
                           <option key={d.id} value={d.id}>{d.full_name}</option>
                         ))}
                      </select>
                   </div>
                </div>

                <div className="flex gap-4 pt-4">
                   <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 h-14 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white rounded-2xl font-black transition-all"
                   >
                     Cancel
                   </button>
                   <button 
                    type="submit"
                    className="flex-1 h-14 bg-brand-500 text-white rounded-2xl font-black shadow-xl shadow-brand-500/20 hover:scale-105 transition-all"
                   >
                     Create Asset
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
