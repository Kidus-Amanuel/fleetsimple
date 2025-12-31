"use client";
import React, { useEffect, useState } from "react";
import { dashboardService } from "@/api/services/dashboard.service";
import { useAuth } from "@/context/AuthContext";

import AddVehicleModal from "@/components/dashboard/AddVehicleModal";

// Helper function to calculate relative time
function getRelativeTime(dateString: string | Date): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

// Helper function to calculate trip progress (mock for now)
function calculateTripProgress(startTime: string): number {
  const start = new Date(startTime).getTime();
  const now = new Date().getTime();
  const elapsed = now - start;
  // Assume average trip is 2 hours, calculate percentage
  const estimatedDuration = 2 * 60 * 60 * 1000; // 2 hours in ms
  return Math.min(Math.round((elapsed / estimatedDuration) * 100), 95);
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [activeTrips, setActiveTrips] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    async function loadData() {
      if (authLoading) return;
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [statsData, tripsData, activityData] = await Promise.all([
          dashboardService.getStats(user.id),
          dashboardService.getActiveTrips(user.id),
          dashboardService.getRecentActivity(user.id),
        ]);

        setStats(statsData);
        setActiveTrips(tripsData);
        setRecentActivity(activityData);
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, authLoading, refreshTrigger]);

  // Default stats if no data
  const dashboardStats = [
    {
      title: "Total Vehicles",
      value: stats?.total_vehicles?.toString() || "0",
      change: `${stats?.available_vehicles || 0} available`,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: "bg-blue-500",
    },
    {
      title: "Available",
      value: stats?.available_vehicles?.toString() || "0",
      change: stats?.total_vehicles ? `${Math.round((stats.available_vehicles / stats.total_vehicles) * 100)}% of fleet` : "0% of fleet",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-green-500",
    },
    {
      title: "In Use",
      value: stats?.in_use_vehicles?.toString() || "0",
      change: stats?.ongoing_trips ? `${stats.ongoing_trips} active trips` : "No active trips",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        </svg>
      ),
      color: "bg-yellow-500",
    },
    {
      title: "Maintenance",
      value: stats?.maintenance_vehicles?.toString() || "0",
      change: stats?.pending_maintenance ? `${stats.pending_maintenance} pending` : "None pending",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        </svg>
      ),
      color: "bg-red-500",
    },
  ];

  const quickStats = [
    { label: "Today's Trips", value: stats?.today_trips?.toString() || "0", unit: "trips" },
    { label: "Distance", value: stats?.today_distance?.toFixed(1) || "0", unit: "km" },
    { label: "Fuel Cost", value: `$${stats?.today_fuel_cost?.toFixed(0) || "0"}`, unit: "today" },
    { label: "Active Drivers", value: stats?.active_drivers?.toString() || "0", unit: "online" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>

        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsAddVehicleModalOpen(true)}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition"
          >
            Add Vehicle
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-300">
            <strong>Error loading dashboard data:</strong> {error}
          </p>
        </div>
      )}

      {loading && !error ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {dashboardStats.map((stat) => (
              <div key={stat.title} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{stat.change}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg text-white`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickStats.map((stat) => (
              <div key={stat.label} className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl p-5 text-white">
                <p className="text-sm opacity-90">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <p className="text-xs opacity-75 mt-1">{stat.unit}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Active Trips */}
            <div className="xl:col-span-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Active Trips</h2>
                <a href="/position" className="text-brand-500 hover:text-brand-600 text-sm font-medium">View Map →</a>
              </div>
              <div className="space-y-4">
                {activeTrips.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No active trips at the moment</p>
                  </div>
                ) : (
                  activeTrips.map((trip: any) => {
                    const vehicleInfo = trip.vehicles;
                    const driverInfo = trip.drivers;
                    const progress = calculateTripProgress(trip.start_time);

                    return (
                      <div key={trip.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {vehicleInfo?.vehicle_number || "Unknown"} {vehicleInfo?.make || ""} {vehicleInfo?.model || ""}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Driver: {driverInfo?.full_name || "Unknown"}
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                            In Progress
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                          {trip.start_location} → {trip.end_location}
                        </p>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-brand-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{progress}% complete</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No recent activity</p>
                  </div>
                ) : (
                  recentActivity.map((activity: any, index: number) => (
                    <div key={index} className="flex gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${activity.type === 'success' ? 'bg-green-500' :
                        activity.type === 'warning' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{activity.detail}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{getRelativeTime(activity.time)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bottom Support Section */}
      <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">Need Support?</h3>
            <p className="text-brand-100">Get help from our team via the command center</p>
          </div>
          <button className="px-6 py-3 bg-white text-brand-500 rounded-lg hover:bg-gray-100 transition font-medium">
            Open Command Center
          </button>
        </div>
      </div>

      <AddVehicleModal
        isOpen={isAddVehicleModalOpen}
        onClose={() => setIsAddVehicleModalOpen(false)}
        onSuccess={() => setRefreshTrigger(prev => prev + 1)}
      />
    </div>
  );
}


