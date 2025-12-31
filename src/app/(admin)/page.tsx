import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Dashboard | Simple - Fleet Management System",
  description: "Fleet management dashboard with real-time analytics",
};

// Dummy data
const stats = [
  {
    title: "Total Vehicles",
    value: "24",
    change: "+2 this month",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: "bg-blue-500",
  },
  {
    title: "Available",
    value: "18",
    change: "75% of fleet",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "bg-green-500",
  },
  {
    title: "In Use",
    value: "4",
    change: "Active trips",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      </svg>
    ),
    color: "bg-yellow-500",
  },
  {
    title: "Maintenance",
    value: "2",
    change: "Due this week",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      </svg>
    ),
    color: "bg-red-500",
  },
];

const activeTrips = [
  { id: 1, vehicle: "FLT-001 Toyota Camry", driver: "John Smith", route: "Main Office → Client Site A", status: "in_progress", progress: 65 },
  { id: 2, vehicle: "FLT-006 Nissan Leaf", driver: "Sarah Johnson", route: "Warehouse → Downtown", status: "in_progress", progress: 30 },
  { id: 3, vehicle: "FLT-002 Ford Transit", driver: "Mike Davis", route: "Airport → Hotel", status: "in_progress", progress: 85 },
  { id: 4, vehicle: "FLT-005 Chevrolet Silverado", driver: "David Wilson", route: "Service Center → Client B", status: "in_progress", progress: 45 },
];

const recentActivity = [
  { time: "10 min ago", action: "Trip completed", detail: "FLT-003 - 32.8 km", type: "success" },
  { time: "25 min ago", action: "Fuel record added", detail: "FLT-001 - $68.25", type: "info" },
  { time: "1 hour ago", action: "Maintenance scheduled ", detail: "FLT-004 - Oil change", type: "warning" },
  { time: "2 hours ago", action: "New driver added", detail: "Emily Brown", type: "info" },
  { time: "3 hours ago", action: "Trip started", detail: "FLT-002 - Main Office", type: "success" },
];

const quickStats = [
  { label: "Today's Trips", value: "12", unit: "trips" },
  { label: "Distance", value: "324.5", unit: "km" },
  { label: "Fuel Cost", value: "$245", unit: "today" },
  { label: "Active Drivers", value: "8", unit: "online" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here s what s happening with your fleet today.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            Export Report
          </button>
          <button className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition">
            Add Vehicle
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
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
            {activeTrips.map((trip) => (
              <div key={trip.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{trip.vehicle}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Driver: {trip.driver}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                    In Progress
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{trip.route}</p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-brand-500 h-2 rounded-full transition-all" style={{ width: `${trip.progress}%` }}></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{trip.progress}% complete</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  activity.type === 'success' ? 'bg-green-500' : 
                  activity.type === 'warning' ? 'bg-yellow-500' : 
                  'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{activity.detail}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
    </div>
  );
}
