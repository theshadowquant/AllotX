'use client';

import React, { useState } from 'react';
import { Activity, ShieldCheck, Database, Plus, RefreshCw, AlertCircle } from 'lucide-react';

interface RegistrarHealthItem {
  id: string;
  code: string;
  name: string;
  officialUrl: string;
  active: boolean;
  healthStatus: 'OPERATIONAL' | 'DEGRADED' | 'UNAVAILABLE' | string;
}

interface AuditCheckItem {
  id: string;
  applicantName: string;
  panMasked: string;
  ipoName: string;
  registrarCode: string;
  status: string;
  durationMs: number;
  errorCode?: string | null;
  checkedAt: string;
}

interface AdminDashboardProps {
  stats: {
    totalIPOs: number;
    totalApplicants: number;
    totalChecks: number;
  };
  registrars: RegistrarHealthItem[];
  recentChecks: AuditCheckItem[];
  dataProvider: string;
  onRefreshData: () => void;
}

export function AdminDashboard({
  stats,
  registrars,
  recentChecks,
  dataProvider,
  onRefreshData,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'health' | 'audit' | 'settings'>('health');

  const getHealthBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'OPERATIONAL':
        return (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Operational
          </span>
        );
      case 'DEGRADED':
        return (
          <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Degraded Performance
          </span>
        );
      case 'UNAVAILABLE':
      default:
        return (
          <span className="flex items-center gap-1.5 text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
            <span className="w-2 h-2 rounded-full bg-rose-400" /> Unavailable
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="fintech-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wider block">Total Active IPOs</span>
            <span className="text-2xl font-extrabold text-white mt-0.5 block">{stats.totalIPOs}</span>
          </div>
          <Database className="w-8 h-8 text-indigo-400 opacity-60" />
        </div>

        <div className="fintech-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wider block">Tracked Applicants</span>
            <span className="text-2xl font-extrabold text-emerald-400 mt-0.5 block">{stats.totalApplicants}</span>
          </div>
          <ShieldCheck className="w-8 h-8 text-emerald-400 opacity-60" />
        </div>

        <div className="fintech-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wider block">Total Allotment Checks</span>
            <span className="text-2xl font-extrabold text-blue-400 mt-0.5 block">{stats.totalChecks}</span>
          </div>
          <Activity className="w-8 h-8 text-blue-400 opacity-60" />
        </div>
      </div>

      {/* Control Tabs */}
      <div className="fintech-card p-5">
        <div className="flex items-center justify-between border-b border-border/80 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('health')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'health'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-gray-400 hover:text-white hover:bg-card'
              }`}
            >
              Registrar Health Monitor
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'audit'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-gray-400 hover:text-white hover:bg-card'
              }`}
            >
              Audit Log History
            </button>
          </div>

          <button
            onClick={onRefreshData}
            className="p-2 text-gray-400 hover:text-white hover:bg-card rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Tab 1: Registrar Health Monitor */}
        {activeTab === 'health' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Live status of Indian registrar enquiry services and integration adapters.
              </p>
              <span className="text-[11px] font-mono text-gray-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                Mode: <strong className="text-emerald-400 uppercase">{dataProvider}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {registrars.map((r) => (
                <div key={r.id} className="bg-card/70 border border-border p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-sm text-gray-100">{r.name}</h5>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{r.code}</p>
                    <a
                      href={r.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-indigo-400 hover:underline mt-1 inline-block"
                    >
                      {r.officialUrl}
                    </a>
                  </div>
                  {getHealthBadge(r.healthStatus)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Allotment Check Audit Log */}
        {activeTab === 'audit' && (
          <div className="space-y-3">
            <p className="text-xs text-gray-400 mb-2">
              Recent allotment checks recorded in database (`AllotmentCheck` table).
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border/80 text-gray-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Applicant</th>
                    <th className="py-2.5 px-3">IPO</th>
                    <th className="py-2.5 px-3">Registrar</th>
                    <th className="py-2.5 px-3">Result</th>
                    <th className="py-2.5 px-3">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-gray-300">
                  {recentChecks.map((item) => (
                    <tr key={item.id} className="hover:bg-card/50">
                      <td className="py-2.5 px-3 font-mono text-gray-400">
                        {new Date(item.checkedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-gray-200">
                        {item.applicantName} ({item.panMasked})
                      </td>
                      <td className="py-2.5 px-3 text-indigo-300 font-medium">{item.ipoName}</td>
                      <td className="py-2.5 px-3 font-mono text-gray-400">{item.registrarCode}</td>
                      <td className="py-2.5 px-3">
                        <span className={`font-bold ${item.status === 'ALLOTTED' ? 'text-emerald-400' : item.status === 'NOT_ALLOTTED' ? 'text-rose-400' : 'text-amber-400'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-gray-400">{item.durationMs}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
