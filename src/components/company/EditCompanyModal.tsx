import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { api } from "@/api";
import { toast } from "react-hot-toast";

interface EditCompanyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    company: any;
}

export default function EditCompanyModal({ isOpen, onClose, onSuccess, company }: EditCompanyModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        registration_number: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        country: "",
        logo_url: ""
    });

    useEffect(() => {
        if (isOpen && company) {
            setFormData({
                name: company.name || "",
                registration_number: company.registration_number || "",
                email: company.email || "",
                phone: company.phone || "",
                address: company.address || "",
                city: company.city || "",
                country: company.country || "",
                logo_url: company.logo_url || ""
            });
        }
    }, [isOpen, company]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!company?.id) return;

        setLoading(true);
        try {
            await api.companies.updateCompany(company.id, formData);
            toast.success("Company profile updated");
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Failed to update company", error);
            toast.error(error.message || "Failed to update company");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Edit Company Profile</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Company Name *
                        </label>
                        <input
                            required
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Registration Number
                            </label>
                            <input
                                name="registration_number"
                                value={formData.registration_number}
                                onChange={handleChange}
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
                                className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Address
                        </label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows={2}
                            className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                City
                            </label>
                            <input
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Country
                            </label>
                            <input
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                            />
                        </div>
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
                                "Save Changes"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
