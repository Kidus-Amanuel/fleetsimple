
import React, { useState, useEffect } from 'react';
import { Modal } from "@/components/ui/modal";
import { FuelRecord, Vehicle, Driver } from "@/api/types";
import { FaGasPump, FaCalendarAlt, FaMoneyBillWave, FaCar, FaUserTie, FaTachometerAlt, FaMapMarkerAlt } from "react-icons/fa";

interface AddEditFuelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (record: Partial<FuelRecord>) => Promise<void>;
    initialData?: FuelRecord | null;
    vehicles: Vehicle[];
    drivers: Driver[];
}

export default function AddEditFuelModal({
    isOpen,
    onClose,
    onSave,
    initialData,
    vehicles,
    drivers
}: AddEditFuelModalProps) {
    const [formData, setFormData] = useState<Partial<FuelRecord>>({
        vehicle_id: undefined,
        driver_id: undefined,
        fuel_date: new Date().toISOString().split('T')[0],
        quantity: 0,
        cost: 0,
        mileage: 0,
        station_name: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                fuel_date: initialData.fuel_date ? new Date(initialData.fuel_date).toISOString().split('T')[0] : '',
            });
        } else {
            setFormData({
                vehicle_id: vehicles.length > 0 ? vehicles[0].id : undefined,
                driver_id: undefined, // Optional
                fuel_date: new Date().toISOString().split('T')[0],
                quantity: 0,
                cost: 0,
                mileage: 0,
                station_name: '',
            });
        }
    }, [initialData, isOpen, vehicles]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error("Failed to save", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                        <FaGasPump />
                    </div>
                    {initialData ? 'Edit Fuel Record' : 'Add Fuel Record'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Vehicle Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                            <div className="relative">
                                <FaCar className="absolute left-3 top-3 text-gray-400" />
                                <select
                                    required
                                    value={formData.vehicle_id}
                                    onChange={(e) => setFormData({ ...formData, vehicle_id: Number(e.target.value) })}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select a vehicle</option>
                                    {vehicles.map((v) => (
                                        <option key={v.id} value={v.id}>
                                            {v.vehicle_number} - {v.make} {v.model}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Driver Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Driver (Optional)</label>
                            <div className="relative">
                                <FaUserTie className="absolute left-3 top-3 text-gray-400" />
                                <select
                                    value={formData.driver_id || ''}
                                    onChange={(e) => setFormData({ ...formData, driver_id: e.target.value ? Number(e.target.value) : undefined })}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select a driver</option>
                                    {drivers.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.full_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Quantity */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (L)</label>
                            <div className="relative">
                                <FaGasPump className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    required
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Cost */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
                            <div className="relative">
                                <FaMoneyBillWave className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    required
                                    value={formData.cost}
                                    onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Mileage */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mileage (Odometer)</label>
                            <div className="relative">
                                <FaTachometerAlt className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={formData.mileage || ''}
                                    onChange={(e) => setFormData({ ...formData, mileage: Number(e.target.value) })}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <div className="relative">
                                <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="date"
                                    required
                                    value={formData.fuel_date}
                                    onChange={(e) => setFormData({ ...formData, fuel_date: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Station Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gas Station</label>
                        <div className="relative">
                            <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="E.g. Shell, BP..."
                                value={formData.station_name || ''}
                                onChange={(e) => setFormData({ ...formData, station_name: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Record'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
