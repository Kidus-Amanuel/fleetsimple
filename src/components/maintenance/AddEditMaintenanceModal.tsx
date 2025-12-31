
import React, { useState, useEffect } from 'react';
import { Modal } from "@/components/ui/modal";
import { MaintenanceRecord, Vehicle } from "@/api/types";
import { FaWrench, FaCalendarAlt, FaMoneyBillWave, FaCar } from "react-icons/fa";

interface AddEditMaintenanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (record: Partial<MaintenanceRecord>) => Promise<void>;
    initialData?: MaintenanceRecord | null;
    vehicles: Vehicle[];
}

export default function AddEditMaintenanceModal({
    isOpen,
    onClose,
    onSave,
    initialData,
    vehicles
}: AddEditMaintenanceModalProps) {
    const [formData, setFormData] = useState<Partial<MaintenanceRecord>>({
        vehicle_id: undefined,
        service_type: 'routine',
        description: '',
        cost: 0,
        service_date: new Date().toISOString().split('T')[0],
        status: 'scheduled',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                service_date: initialData.service_date ? new Date(initialData.service_date).toISOString().split('T')[0] : '',
                next_service_date: initialData.next_service_date ? new Date(initialData.next_service_date).toISOString().split('T')[0] : '',
            });
        } else {
            setFormData({
                vehicle_id: vehicles.length > 0 ? vehicles[0].id : undefined,
                service_type: 'routine',
                description: '',
                cost: 0,
                service_date: new Date().toISOString().split('T')[0],
                status: 'scheduled',
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
                        <FaWrench />
                    </div>
                    {initialData ? 'Edit Maintenance' : 'Schedule Maintenance'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Service Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                required
                                value={formData.service_type}
                                onChange={(e) => setFormData({ ...formData, service_type: e.target.value as any })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="routine">Routine</option>
                                <option value="repair">Repair</option>
                                <option value="inspection">Inspection</option>
                                <option value="emergency">Emergency</option>
                            </select>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                required
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="scheduled">Scheduled</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="E.g., Oil change, Brake pad replacement..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Service Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Service Date</label>
                            <div className="relative">
                                <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="date"
                                    required
                                    value={formData.service_date}
                                    onChange={(e) => setFormData({ ...formData, service_date: e.target.value })}
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
                                    value={formData.cost}
                                    onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
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
