import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Manage Drivers | Simple - Fleet Management System",
  description: "Manage your fleet drivers",
};

const drivers = [
  { id: 1, name: "John Smith", email: "john.smith@fleet.com", phone: "+1-555-0101", license: "DL001234", expiry: "2026-12-31", status: "active", rating: 4.8, trips: 45 },
  { id: 2, name: "Sarah Johnson", email: "sarah.j@fleet.com", phone: "+1-555-0102", license: "DL001235", expiry: "2025-08-15", status: "active", rating: 4.9, trips: 52 },
  { id: 3, name: "Mike Davis", email: "mike.d@fleet.com", phone: "+1-555-0103", license: "DL001236", expiry: "2026-03-20", status: "active", rating: 4.7, trips: 38 },
  { id: 4, name: "Emily Brown", email: "emily.b@fleet.com", phone: "+1-555-0104", license: "DL001237", expiry: "2025-11-10", status: "on_leave", rating: 4.6, trips: 28 },
  { id: 5, name: "David Wilson", email: "david.w@fleet.com", phone: "+1-555-0105", license: "DL001238", expiry: "2026-06-25", status: "active", rating: 4.9, trips: 42 },
];

export default function ManageDrivers() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Drivers</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Add, edit, and manage your drivers</p>
        </div>
        <div className="flex gap-3">
          <input 
            type="search" 
            placeholder="Search drivers..." 
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white w-64"
          />
          <button className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition">
            + Add Driver
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Drivers</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{drivers.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{drivers.filter(d => d.status === 'active').length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {(drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length).toFixed(1)}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">License</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Expiry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Trips</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {drivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                        {driver.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{driver.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="text-gray-900 dark:text-white">{driver.email}</div>
                      <div className="text-gray-500 dark:text-gray-500">{driver.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{driver.license}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{driver.expiry}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      driver.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                    }`}>
                      {driver.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{driver.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{driver.trips}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-brand-500 hover:text-brand-600 mr-3">Edit</button>
                    <button className="text-blue-500 hover:text-blue-600 mr-3">View</button>
                    <button className="text-red-500 hover:text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
