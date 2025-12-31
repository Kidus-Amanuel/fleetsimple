
"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { Vehicle } from "@/api/types";
import { FaChartBar, FaFileDownload, FaSpinner } from "react-icons/fa";

export default function Analytics() {
  const { company } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("6m"); // 6m, 12m, year
  const [searchTerm, setSearchTerm] = useState("");

  // Aggregated Data
  const [metrics, setMetrics] = useState({
    totalTrips: 0,
    totalDistance: 0,
    fuelCost: 0,
    utilization: 0,
    tripsTrend: 0,
    distanceTrend: 0,
    costTrend: 0,
    utilizationTrend: 0
  });

  const [monthlyData, setMonthlyData] = useState<{ month: string, trips: number, distance: number }[]>([]);
  const [vehicleStats, setVehicleStats] = useState<any[]>([]);

  useEffect(() => {
    if (company?.id) {
      fetchData();
    }
  }, [company?.id, timeRange]);

  const fetchData = async () => {
    if (!company?.id) return;
    setLoading(true);

    try {
      // Calculate dates
      const now = new Date();
      const endDate = now.toISOString();
      let startDate = new Date();

      if (timeRange === "6m") startDate.setMonth(now.getMonth() - 6);
      else if (timeRange === "12m") startDate.setMonth(now.getMonth() - 12);
      else if (timeRange === "year") startDate = new Date(now.getFullYear(), 0, 1);

      // Previous period for comparison
      const periodDuration = now.getTime() - startDate.getTime();
      const prevEndDate = new Date(startDate);
      const prevStartDate = new Date(startDate.getTime() - periodDuration);

      const [currentData, prevData, vehicles] = await Promise.all([
        api.analytics.getAnalyticsData(company.id, startDate.toISOString(), endDate),
        api.analytics.getAnalyticsData(company.id, prevStartDate.toISOString(), prevEndDate.toISOString()),
        api.vehicles.getVehicles(company.id)
      ]);

      // --- AGGREGATION LOGIC ---

      // 1. Key Metrics
      const currentTrips = currentData.trips.length;
      const prevTrips = prevData.trips.length;
      const tripsTrend = prevTrips ? ((currentTrips - prevTrips) / prevTrips) * 100 : 0;

      const currentDist = currentData.trips.reduce((acc, t) => acc + (t.distance || 0), 0);
      const prevDist = prevData.trips.reduce((acc, t) => acc + (t.distance || 0), 0);
      const distanceTrend = prevDist ? ((currentDist - prevDist) / prevDist) * 100 : 0;

      const currentCost = currentData.fuel.reduce((acc, f) => acc + (f.cost || 0), 0);
      const prevCost = prevData.fuel.reduce((acc, f) => acc + (f.cost || 0), 0);
      const costTrend = prevCost ? ((currentCost - prevCost) / prevCost) * 100 : 0;

      // Utilization: Avg trips per vehicle (simplified proxy)
      const currentUtil = vehicles.length ? (currentTrips / vehicles.length) : 0;
      const prevUtil = vehicles.length ? (prevTrips / vehicles.length) : 0;
      const utilTrend = prevUtil ? ((currentUtil - prevUtil) / prevUtil) * 100 : 0;

      setMetrics({
        totalTrips: currentTrips,
        totalDistance: currentDist,
        fuelCost: currentCost,
        utilization: Math.round(currentUtil), // showing trips/vehicle as simple utilization metric
        tripsTrend,
        distanceTrend,
        costTrend,
        utilizationTrend: utilTrend
      });

      // 2. Monthly Data
      const months = new Map<string, { trips: number, distance: number }>();

      // Initialize months based on range to ensure all are shown
      let d = new Date(startDate);
      while (d <= now) {
        const key = d.toLocaleString('default', { month: 'short' });
        months.set(key, { trips: 0, distance: 0 });
        d.setMonth(d.getMonth() + 1);
      }

      currentData.trips.forEach(t => {
        const date = new Date(t.start_time);
        const key = date.toLocaleString('default', { month: 'short' });
        if (months.has(key)) {
          const existing = months.get(key)!;
          existing.trips++;
          existing.distance += (t.distance || 0);
        }
      });

      setMonthlyData(Array.from(months.entries()).map(([month, data]) => ({ month, ...data })));

      // 3. Vehicle Stats
      const vStats = vehicles.map(v => {
        const vTrips = currentData.trips.filter(t => t.vehicle_id === v.id);
        const vFuel = currentData.fuel.filter(f => f.vehicle_id === v.id);

        const distance = vTrips.reduce((acc, t) => acc + (t.distance || 0), 0);
        const trips = vTrips.length;
        const fuelQty = vFuel.reduce((acc, f) => acc + (f.quantity || 0), 0);

        const efficiency = fuelQty > 0 ? (distance / fuelQty) : 0;

        return {
          id: v.id,
          vehicle: v.vehicle_number,
          trips,
          distance,
          efficiency,
          utilization: 0 // placeholder
        };
      });

      // Normalize utilization
      const maxTripsVal = Math.max(...vStats.map(v => v.trips), 1);
      const finalVStats = vStats.map(v => ({
        ...v,
        utilization: Math.round((v.trips / maxTripsVal) * 100)
      }));

      setVehicleStats(finalVStats);

    } catch (error) {
      console.error("Failed to fetch analytics", error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    // Simple CSV Export
    const headers = ["Vehicle", "Trips", "Distance (km)", "Efficiency (km/L)", "Utilization (%)"];
    const rows = vehicleStats.map(v => [
      v.vehicle,
      v.trips,
      v.distance.toFixed(1),
      v.efficiency.toFixed(1),
      v.utilization
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fleet_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!company) return <div className="p-8 text-center text-gray-500">Loading company information...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Fleet performance insights and trends</p>
        </div>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="6m">Last 6 Months</option>
            <option value="12m">Last 12 Months</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={exportReport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <FaFileDownload /> Export Report
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin text-blue-600 text-4xl"><FaSpinner /></div>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <p className="text-sm opacity-90">Total Trips</p>
              <p className="text-3xl font-bold mt-2">{metrics.totalTrips}</p>
              <p className="text-xs opacity-75 mt-2">
                {metrics.tripsTrend >= 0 ? '↑' : '↓'} {Math.abs(metrics.tripsTrend).toFixed(1)}% from last period
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
              <p className="text-sm opacity-90">Distance</p>
              <p className="text-3xl font-bold mt-2">{metrics.totalDistance.toLocaleString()} km</p>
              <p className="text-xs opacity-75 mt-2">
                {metrics.distanceTrend >= 0 ? '↑' : '↓'} {Math.abs(metrics.distanceTrend).toFixed(1)}% from last period
              </p>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
              <p className="text-sm opacity-90">Fuel Cost</p>
              <p className="text-3xl font-bold mt-2">${metrics.fuelCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
              <p className="text-xs opacity-75 mt-2">
                {metrics.costTrend >= 0 ? '↑' : '↓'} {Math.abs(metrics.costTrend).toFixed(1)}% from last period
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <p className="text-sm opacity-90">Avg Trips/Vehicle</p>
              <p className="text-3xl font-bold mt-2">{metrics.utilization}</p>
              <p className="text-xs opacity-75 mt-2">
                {metrics.utilizationTrend >= 0 ? '↑' : '↓'} {Math.abs(metrics.utilizationTrend).toFixed(1)}% from last period
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Monthly Trips Chart */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Monthly Trips</h2>
              <div className="space-y-3">
                {monthlyData.map((data) => {
                  const maxTrips = Math.max(...monthlyData.map(d => d.trips), 10); // avoid div by zero
                  const widthPercent = (data.trips / maxTrips) * 100;
                  return (
                    <div key={data.month}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-10">{data.month}</span>
                        <div className="flex-1 mx-3 bg-gray-100 dark:bg-gray-700 rounded-full h-3">
                          <div className="bg-blue-500 h-3 rounded-full transition-all" style={{ width: `${widthPercent}%` }}></div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-16 text-right">{data.trips}</span>
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
                  const maxDistance = Math.max(...monthlyData.map(d => d.distance), 100);
                  const widthPercent = (data.distance / maxDistance) * 100;
                  return (
                    <div key={data.month}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-10">{data.month}</span>
                        <div className="flex-1 mx-3 bg-gray-100 dark:bg-gray-700 rounded-full h-3">
                          <div className="bg-green-500 h-3 rounded-full transition-all" style={{ width: `${widthPercent}%` }}></div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-20 text-right">{Math.round(data.distance).toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Vehicle Performance Table */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Vehicle Performance</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search vehicles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white w-full md:w-64"
                />
              </div>
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
                      Relative Utilization
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {vehicleStats.filter(v => v.vehicle.toLowerCase().includes(searchTerm.toLowerCase())).map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900 dark:text-white">{vehicle.vehicle}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                        {vehicle.trips}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                        {vehicle.distance.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${vehicle.efficiency > 12 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                          'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          }`}>
                          {vehicle.efficiency.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className={`h-2 rounded-full ${vehicle.utilization > 80 ? 'bg-green-500' :
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
        </>
      )}
    </div>
  );
}
