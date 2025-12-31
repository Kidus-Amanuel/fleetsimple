import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Maintenance | Simple - Fleet Management System",
  description: "Vehicle maintenance tracking and scheduling",
};

const maintenanceRecords = [
  { id: 1, date: "2024-12-28", vehicle: "FLT-004", type: "routine", description: "Oil change and tire rotation", cost: 125.00, nextService: "2025-03-28", status: "completed" },
  { id: 2, date: "2024-12-20", vehicle: "FLT-007", type: "repair", description: "Brake pad replacement", cost: 350.00, nextService: null, status: "completed" },
  { id: 3, date: "2024-11-15", vehicle: "FLT-001", type: "inspection", description: "Annual safety inspection", cost: 75.00, nextService: "2025-11-15", status: "completed" },
  { id: 4, date: "2025-01-05", vehicle: "FLT-003", type: "routine", description: "Scheduled oil change", cost: 0, nextService: "2025-07-05", status: "scheduled" },
  { id: 5, date: "2025-01-10", vehicle: "FLT-004", type: "inspection", description: "Emissions test", cost: 0, nextService: null, status: "scheduled" },
];

const upcomingMaintenance = maintenanceRecords.filter(r => r.status === 'scheduled');
const completedMaintenance = maintenanceRecords.filter(r => r.status === 'completed');

export default function Maintenance() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Maintenance</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track and schedule vehicle maintenance</p>
        </div>
        <button className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition">
          Schedule Maintenance
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Scheduled</p>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">{upcomingMaintenance.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Completed This Month</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{completedMaintenance.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Cost (Month)</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">${completedMaintenance.reduce((sum, r) => sum + r.cost, 0)}</p>
        </div>
      </div>

      {/* Upcoming Maintenance */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Upcoming Maintenance</h2>
        <div className="space-y-4">
          {upcomingMaintenance.map((record) => (
            <div key={record.id} className="border border-yellow-200 dark:border-yellow-900/30 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white">{record.vehicle}</span>
                    <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-medium rounded-full">
                      {record.type}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{record.date}</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{record.description}</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                    Edit
                  </button>
                  <button className="px-3 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 text-sm">
                    Complete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Maintenance History */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Maintenance History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Next Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {completedMaintenance.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{record.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{record.vehicle}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      record.type === 'routine' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                      record.type === 'repair' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                      'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    }`}>
                      {record.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{record.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${record.cost.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{record.nextService || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-brand-500 hover:text-brand-600 mr-3">View</button>
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
