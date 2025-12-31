import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Analytics | Simple - Fleet Management System",
  description: "Fleet performance analytics and insights",
};

const monthlyData = [
  { month: "Jan", trips: 145, distance: 3500, fuel: 2800, maintenance: 1200 },
  { month: "Feb", trips: 168, distance: 3950, fuel: 3100, maintenance: 950 },
  { month: "Mar", trips: 182, distance: 4200, fuel: 3400, maintenance: 1500 },
  { month: "Apr", trips: 175, distance: 4050, fuel: 3250, maintenance: 800 },
  { month: "May", trips: 195, distance: 4650, fuel: 3700, maintenance: 1100 },
  { month: "Jun", trips: 188, distance: 4400, fuel: 3500, maintenance: 1300 },
];

const vehiclePerformance = [
  { vehicle: "FLT-001", trips: 45, distance: 1250, fuelEff: 12.5, utilization: 85 },
  { vehicle: "FLT-002", trips: 52, distance: 1580, fuelEff: 10.2, utilization: 92 },
  { vehicle: "FLT-003", trips: 38, distance: 980, fuelEff: 15.8, utilization: 72 },
  { vehicle: "FLT-004", trips: 28, distance: 720, fuelEff: 13.2, utilization: 58 },
  { vehicle: "FLT-005", trips: 42, distance: 1150, fuelEff: 9.8, utilization: 78 },
];

export default function Analytics() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Fleet performance insights and trends</p>
        </div>
        <div className="flex gap-3">
          <select className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg">
            <option>Last 6 Months</option>
            <option>Last 12 Months</option>
            <option>This Year</option>
          </select>
          <button className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition">
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <p className="text-sm opacity-90">Total Trips</p>
          <p className="text-3xl font-bold mt-2">1,053</p>
          <p className="text-xs opacity-75 mt-2">↑ 12% from last period</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <p className="text-sm opacity-90">Distance</p>
          <p className="text-3xl font-bold mt-2">24,750 km</p>
          <p className="text-xs opacity-75 mt-2">↑ 8% from last period</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <p className="text-sm opacity-90">Fuel Cost</p>
          <p className="text-3xl font-bold mt-2">$19,750</p>
          <p className="text-xs opacity-75 mt-2">↓ 3% from last period</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <p className="text-sm opacity-90">Avg Utilization</p>
          <p className="text-3xl font-bold mt-2">77%</p>
          <p className="text-xs opacity-75 mt-2">↑ 5% from last period</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Monthly Trips Chart */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Monthly Trips</h2>
          <div className="space-y-3">
            {monthlyData.map((data) => {
              const maxTrips = Math.max(...monthlyData.map(d => d.trips));
              const widthPercent = (data.trips / maxTrips) * 100;
              return (
                <div key={data.month}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{data.month}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{data.trips} trips</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div className="bg-brand-500 h-3 rounded-full transition-all" style={{ width: `${widthPercent}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distance Chart */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Distance Traveled (km)</h2>
          <div className="space-y-3">
            {monthlyData.map((data) => {
              const maxDistance = Math.max(...monthlyData.map(d => d.distance));
              const widthPercent = (data.distance / maxDistance) * 100;
              return (
                <div key={data.month}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{data.month}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{data.distance.toLocaleString()} km</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full transition-all" style={{ width: `${widthPercent}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Vehicle Performance Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Vehicle Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Trips
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Distance (km)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fuel Efficiency (km/L)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Utilization
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {vehiclePerformance.map((vehicle) => (
                <tr key={vehicle.vehicle} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900 dark:text-white">{vehicle.vehicle}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                    {vehicle.trips}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                    {vehicle.distance.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      vehicle.fuelEff > 12 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                    }`}>
                      {vehicle.fuelEff}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className={`h-2 rounded-full ${
                          vehicle.utilization > 80 ? 'bg-green-500' :
                          vehicle.utilization > 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`} style={{ width: `${vehicle.utilization}%` }}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-10">{vehicle.utilization}%</span>
                    </div>
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
