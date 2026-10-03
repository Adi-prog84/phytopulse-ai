import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import SimulationBanner from '../components/SimulationBanner';
import Toast from '../components/Toast';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      {/* Simulation Banner - Sticky at the very top */}
      <SimulationBanner />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Navbar />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-slate-900 to-slate-950">
            <div className="max-w-7xl mx-auto space-y-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      <Toast />
    </div>
  );
}
