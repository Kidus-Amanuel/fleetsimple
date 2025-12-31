import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { api } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

interface AddEditVehicleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    vehicleToEdit?: any | null;
}

export default function AddEditVehicleModal({ isOpen, onClose, onSuccess, vehicleToEdit }: AddEditVehicleModalProps) {
    const { company } = useAuth();
    const [loading, setLoading] = useState(false);
    const [drivers, setDrivers] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        vehicle_number: "",
        make: "",
        model: "",
        year: new Date().getFullYear(),
        license_plate: "",
        fuel_type: "petrol",
        driver_id: "",
        image_url: ""
    });

    useEffect(() => {
        if (isOpen && company?.id) {
            loadDrivers();
            if (vehicleToEdit) {
                setFormData({
                    vehicle_number: vehicleToEdit.vehicle_number || "",
                    make: vehicleToEdit.make || "",
                    model: vehicleToEdit.model || "",
                    year: vehicleToEdit.year || new Date().getFullYear(),
                    license_plate: vehicleToEdit.license_plate || "",
                    fuel_type: vehicleToEdit.fuel_type || "petrol",
                    driver_id: vehicleToEdit.driver_id || "",
                    image_url: vehicleToEdit.image_url || ""
                });
            } else {
                setFormData({
                    vehicle_number: "",
                    make: "",
                    model: "",
                    year: new Date().getFullYear(),
                    license_plate: "",
                    fuel_type: "petrol",
                    driver_id: "",
                    image_url: ""
                });
            }
        }
    }, [isOpen, company?.id, vehicleToEdit]);

    const loadDrivers = async () => {
        try {
            if (!company?.id) return;
            const data = await api.drivers.getDrivers(company.id);
            setDrivers(data || []);
        } catch (error) {
            console.error("Failed to load drivers", error);
            toast.error("Could not load drivers list");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!company?.id) return;

        setLoading(true);
        try {
            const payload: any = {
                company_id: company.id,
                vehicle_number: formData.vehicle_number,
                make: formData.make,
                model: formData.model,
                year: Number(formData.year),
                license_plate: formData.license_plate,
                fuel_type: formData.fuel_type,
                driver_id: formData.driver_id ? Number(formData.driver_id) : null,
                status: formData.driver_id ? "in_use" : "available",
                image_url: formData.image_url
            };

            if (vehicleToEdit) {
                await api.vehicles.updateVehicle(vehicleToEdit.id, payload);
                toast.success("Vehicle updated successfully");
            } else {
                payload.current_mileage = 0;
                // Ensure status is correctly typed if needed, though 'any' payload bypasses strict check for now
                if (!payload.driver_id) payload.driver_id = undefined; // satisfy optional vs null if strict

                await api.vehicles.createVehicle(payload);
                toast.success("Vehicle added successfully");
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Failed to save vehicle", error);
            toast.error(error.message || "Failed to save vehicle");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                    {vehicleToEdit ? "Edit Vehicle" : "Add New Vehicle"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Vehicle Number *
                            </label>
                            <input
                                required
                                name="vehicle_number"
                                value={formData.vehicle_number}
                                onChange={handleChange}
                                placeholder="e.g. V-101"
                                className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                License Plate *
                            </label>
                            <input
                                required
                                name="license_plate"
                                value={formData.license_plate}
                                onChange={handleChange}
                                placeholder="e.g. ABC-123"
                                className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Make *
                            </label>
                            <input
                                required
                                name="make"
                                value={formData.make}
                                onChange={handleChange}
                                placeholder="e.g. Toyota"
                                className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Model *
                            </label>
                            <input
                                required
                                name="model"
                                value={formData.model}
                                onChange={handleChange}
                                placeholder="e.g. Camry"
                                className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Year
                            </label>
                            <input
                                type="number"
                                name="year"
                                value={formData.year}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Fuel Type
                            </label>
                            <select
                                name="fuel_type"
                                value={formData.fuel_type}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                            >
                                <option value="petrol">Petrol</option>
                                <option value="diesel">Diesel</option>
                                <option value="electric">Electric</option>
                                <option value="hybrid">Hybrid</option>
                            </select>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Assign Driver (Optional)
                        </label>
                        <div className="relative">
                            <select
                                name="driver_id"
                                value={formData.driver_id}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 appearance-none bg-white dark:bg-gray-800"
                            >
                                <option value="">-- No Driver Assigned --</option>
                                {drivers.map((driver) => (
                                    <option key={driver.id} value={driver.id}>
                                        {driver.full_name} ({driver.status})
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Selecting a driver will set the vehicle status to "In Use".
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Saving...
                                </>
                            ) : (
                                vehicleToEdit ? "Update Vehicle" : "Add Vehicle"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
