import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { api } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

interface AddEditDriverModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    driverToEdit?: any | null; // Using any for now to avoid strict type issues with missing fields in types
}

export default function AddEditDriverModal({ isOpen, onClose, onSuccess, driverToEdit }: AddEditDriverModalProps) {
    const { company } = useAuth();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        license_number: "",
        license_expiry: "",
        status: "active",
    });

    useEffect(() => {
        if (isOpen) {
            if (driverToEdit) {
                setFormData({
                    full_name: driverToEdit.full_name || "",
                    email: driverToEdit.email || "",
                    phone: driverToEdit.phone || "",
                    license_number: driverToEdit.license_number || "",
                    license_expiry: driverToEdit.license_expiry || "",
                    status: driverToEdit.status || "active",
                });
            } else {
                // Reset for add mode
                setFormData({
                    full_name: "",
                    email: "",
                    phone: "",
                    license_number: "",
                    license_expiry: "",
                    status: "active",
                });
            }
        }
    }, [isOpen, driverToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!company?.id) return;

        setLoading(true);
        try {
            if (driverToEdit) {
                await api.drivers.updateDriver(driverToEdit.id, {
                    ...formData,
                    status: formData.status as any,
                });
                toast.success("Driver updated successfully");
            } else {
                await api.drivers.createDriver({
                    company_id: company.id,
                    ...formData,
                    status: formData.status as any,
                    rating: 5.0, // Default
                    total_trips: 0,
                    total_distance: 0,
                });
                toast.success("Driver added successfully");
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Failed to save driver", error);
            toast.error(error.message || "Failed to save driver");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                    {driverToEdit ? "Edit Driver" : "Add New Driver"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Full Name *
                        </label>
                        <input
                            required
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            placeholder="e.g. John Doe"
                            className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="e.g. john@example.com"
                                className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Phone
                            </label>
                            <input
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="e.g. +251 911 234 567"
                                className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                License Number *
                            </label>
                            <input
                                required
                                name="license_number"
                                value={formData.license_number}
                                onChange={handleChange}
                                placeholder="e.g. LIC-123456"
                                className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                License Expiry
                            </label>
                            <input
                                type="date"
                                name="license_expiry"
                                value={formData.license_expiry}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Status
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="on_leave">On Leave</option>
                        </select>
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
                                driverToEdit ? "Update Driver" : "Add Driver"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
