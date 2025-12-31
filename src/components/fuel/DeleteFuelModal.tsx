
import React, { useState } from 'react';
import { Modal } from "@/components/ui/modal";
import { FaTrash, FaExclamationTriangle } from "react-icons/fa";

interface DeleteFuelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}

export default function DeleteFuelModal({
    isOpen,
    onClose,
    onConfirm
}: DeleteFuelModalProps) {
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();
            onClose();
        } catch (error) {
            console.error("Failed to delete", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaExclamationTriangle className="text-red-500 text-3xl" />
                </div>

                <h2 className="text-2xl font-bold mb-2">Delete Record?</h2>
                <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                    Are you sure you want to delete this fuel record?
                    This action cannot be undone.
                </p>

                <div className="flex justify-center gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Deleting...' : (
                            <>
                                <FaTrash /> Delete
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
