import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { api } from "@/api";
import { toast } from "react-hot-toast";

interface DeleteVehicleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    vehicleId: number | null;
    vehicleName: string;
}

export default function DeleteVehicleModal({ isOpen, onClose, onConfirm, vehicleId, vehicleName }: DeleteVehicleModalProps) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!vehicleId) return;

        setLoading(true);
        try {
            await api.vehicles.deleteVehicle(vehicleId);
            toast.success("Vehicle deleted successfully");
            onConfirm();
            onClose();
        } catch (error: any) {
            console.error("Failed to delete vehicle", error);
            toast.error(error.message || "Failed to delete vehicle");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Delete Vehicle?</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Are you sure you want to delete <strong>{vehicleName}</strong>? This action cannot be undone.
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Deleting...
                            </>
                        ) : (
                            "Delete Vehicle"
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
