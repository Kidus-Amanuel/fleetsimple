import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Fuel Report | Simple - Fleet Management System",
  description: "Fuel consumption and cost analysis",
};

const fuelRecords = [
  { id: 1, date: "2024-12-31", vehicle: "FLT-001", driver: "John Smith", quantity: 45.5, cost: 68.25, mileage: 15234, station: "Shell Gas Station" },
  { id: 2, date: "2024-12-30", vehicle: "FLT-002", driver: "Mike Davis", quantity: 60.0, cost: 84.00, mileage: 28456, station: "BP Fuel Center" },
  { id: 3, date: "2024-12-29", vehicle: "FLT-005", driver: "David Wilson", quantity: 75.2, cost: 105.28, mileage: 34567, station: "Exxon Station" },
  { id: 4, date: "2024-12-29", vehicle: "FLT-001", driver: "John Smith", quantity: 42.0, cost: 63.00, mileage: 15180, station: "Shell Gas Station" },
  { id: 5, date: "2024-12-28", vehicle: "FLT-003", driver: "Sarah Johnson", quantity: 38.5, cost: 57.75, mileage: 8900, station: "Chevron" },
];

export default function FuelReport() {
  const totalCost = fuelRecords.reduce((sum, record) => sum + record.cost, 0);
  const totalQuantity = fuelRecords.reduce((sum, record) => sum + record.quantity, 0);
  const avgCostPerLiter = totalCost / totalQuantity;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Fuel Report</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track fuel consumption and costs</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            Filter
          </button>
          <button className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition">
            Add Fuel Record
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Fuel Cost</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">${totalCost.toFixed(2)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Last 30 days</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Quantity</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{totalQuantity.toFixed(1)}L</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Last 30 days</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Avg Cost/Liter</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">${avgCostPerLiter.toFixed(2)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Current rate</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Fuel Records</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Quantity (L)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mileage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Station</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {fuelRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{record.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{record.vehicle}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{record.driver}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{record.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${record.cost}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{record.mileage.toLocaleString()} km</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{record.station}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-brand-500 hover:text-brand-600 mr-3">Edit</button>
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
