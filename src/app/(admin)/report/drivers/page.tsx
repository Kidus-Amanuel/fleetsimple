import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Driver Performance | Simple - Fleet Management System",
  description: "Driver performance metrics and analysis",
};

const drivers = [
  { id: 1, name: "John Smith", license: "DL001234", trips: 45, distance: 1250, rating: 4.8, onTime: 95, fuelEff: 12.5, status: "active" },
  { id: 2, name: "Sarah Johnson", license: "DL001235", trips: 52, distance: 1580, rating: 4.9, onTime: 98, fuelEff: 13.2, status: "active" },
  { id: 3, name: "Mike Davis", license: "DL001236", trips: 38, distance: 980, rating: 4.7, onTime: 92, fuelEff: 11.8, status: "active" },
  { id: 4, name: "Emily Brown", license: "DL001237", trips: 28, distance: 720, rating: 4.6, onTime: 89, fuelEff: 12.1, status: "on_leave" },
  { id: 5, name: "David Wilson", license: "DL001238", trips: 42, distance: 1150, rating: 4.9, onTime: 96, fuelEff: 13.5, status: "active" },
];

export default function DriversPerformance() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Driver Performance</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track driver metrics and performance</p>
        </div>
        <button className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition">
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Active Drivers</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{drivers.filter(d => d.status === 'active').length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{(drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length).toFixed(1)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Trips</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{drivers.reduce((sum, d) => sum + d.trips, 0)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Distance</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{drivers.reduce((sum, d) => sum + d.distance, 0).toLocaleString()} km</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Driver Metrics</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">License</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Trips</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Distance (km)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">On-Time %</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Fuel Eff (km/L)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{driver.license}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{driver.trips}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{driver.distance.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{driver.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 w-16">
                        <div className={`h-2 rounded-full ${
                          driver.onTime >= 95 ? 'bg-green-500' :
                          driver.onTime >= 90 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} style={{ width: `${driver.onTime}%` }}></div>
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{driver.onTime}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      driver.fuelEff > 13 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                    }`}>
                      {driver.fuelEff}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      driver.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                    }`}>
                      {driver.status}
                    </span>
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
