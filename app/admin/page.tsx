'use client';

import React, { useState, useEffect } from 'react';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Settings, ShieldCheck, Loader2 } from 'lucide-react';

export default function AdminPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/admin');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (e) {
      console.error('Failed to fetch admin metrics:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
        <span className="text-sm font-semibold">Loading Admin Dashboard & Registrar Health...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
          <Settings className="w-3.5 h-3.5" /> Platform Control Center
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Admin Dashboard & Registrar Health</h1>
        <p className="text-xs text-gray-400 mt-1">
          Monitor live registrar status, inspect allotment check audit logs, and manage data ingestion.
        </p>
      </div>

      <AdminDashboard
        stats={data?.stats || { totalIPOs: 0, totalApplicants: 0, totalChecks: 0 }}
        registrars={data?.registrars || []}
        recentChecks={data?.recentChecks || []}
        dataProvider={data?.dataProvider || 'production'}
        onRefreshData={fetchAdminData}
      />
    </div>
  );
}
