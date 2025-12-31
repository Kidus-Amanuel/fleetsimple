"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import EditCompanyModal from "@/components/company/EditCompanyModal";
import { FaBuilding, FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe, FaEdit } from "react-icons/fa";

export default function CompanyProfile() {
  const { company, refreshAuth } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleSuccess = () => {
    refreshAuth(); // Refresh context to show new data
  };

  if (!company) {
    return <div className="p-8 text-center text-gray-500">Loading company profile...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Company Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your organization's information</p>
        </div>
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition flex items-center gap-2"
        >
          <FaEdit />
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Logo & Basic Overview */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center">
            <div className="w-32 h-32 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden">
              {company.logo_url ? (
                <img src={company.logo_url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <FaBuilding className="text-4xl text-gray-400" />
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{company.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {company.city && company.country ? `${company.city}, ${company.country}` : 'Location n/a'}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                  <FaEnvelope size={14} />
                </div>
                <span className="text-sm">{company.email || 'No email set'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-500">
                  <FaPhone size={14} />
                </div>
                <span className="text-sm">{company.phone || 'No phone set'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Info */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-2">
              General Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Company Name</label>
                <div className="text-gray-900 dark:text-white font-medium">{company.name}</div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Registration Number</label>
                <div className="text-gray-900 dark:text-white font-medium">{company.registration_number || '-'}</div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</label>
                <div className="text-gray-900 dark:text-white font-medium">{company.email || '-'}</div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Phone</label>
                <div className="text-gray-900 dark:text-white font-medium">{company.phone || '-'}</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-2">
              Location Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Full Address</label>
                <div className="text-gray-900 dark:text-white font-medium flex items-start gap-2">
                  <FaMapMarkerAlt className="mt-1 text-gray-400" />
                  {company.address || 'No address provided'}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">City</label>
                <div className="text-gray-900 dark:text-white font-medium">{company.city || '-'}</div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Country</label>
                <div className="text-gray-900 dark:text-white font-medium">{company.country || '-'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditCompanyModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleSuccess}
        company={company}
      />
    </div>
  );
}
