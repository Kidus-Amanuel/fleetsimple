"use client";
import React from "react";
import Link from "next/link";

const SidebarWidget = () => {
  return (
    <div className="mx-4 mb-4">
      <div className="bg-linear-to-br from-brand-500 to-brand-600 rounded-2xl p-4 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-semibold text-lg">Pro Plan</span>
        </div>
        <p className="text-sm text-brand-100 mb-4 leading-relaxed">
          Upgrade to unlock advanced fleet analytics and reports.
        </p>
        <Link 
            href="/manage/settings"
            className="block w-full py-2 px-4 bg-white text-brand-600 text-sm font-medium text-center rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
        >
          Upgrade Now
        </Link>
      </div>
    </div>
  );
};

export default SidebarWidget;
