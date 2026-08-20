'use client';

import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Clock, ShieldCheck, Activity } from 'lucide-react';

interface DataSourceItem {
  id: string;
  code: string;
  name: string;
  status: 'HEALTHY' | 'STALE' | 'FAILED' | 'DISABLED' | string;
  lastSuccessfulUpdate: string | null;
  lastAttempt: string | null;
  errorMessage: string | null;
  refreshIntervalMs: number;
}

interface DataUpdateLogItem {
  id: string;
  sourceCode: string;
  sourceName: string;
  targetType: string;
  status: string;
  recordsFetched: number;
  recordsAccepted: number;
  recordsRejected: number;
  durationMs: number;
  errorMessage: string | null;
  createdAt: string;
}

export default function AdminDataHealthPage() {
  const [dataSources, setDataSources] = useState<DataSourceItem[]>([]);
  const [recentLogs, setRecentLogs] = useState<DataUpdateLogItem[]>([]);
  const [stats, setStats] = useState({ totalIPOs: 0, totalGMPRecords: 0, totalSubRecords: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchHealthData = async () => {
    try {
      const res = await fetch('/api/admin/data-health');
      const json = await res.json();
      if (json.success) {
        setDataSources(json.data.dataSources);
        setRecentLogs(json.data.recentLogs);
        setStats(json.data.stats);
      }
    } catch (e) {
      console.error('Error fetching data health:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/admin/data-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'trigger_ingestion' }),
      });
      const json = await res.json();
      if (json.success) {
        fetchHealthData();
      }
    } catch (e) {
      console.error('Sync trigger error:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> HEALTHY
          </span>
        );
      case 'STALE':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> STALE
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> FAILED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-purple-700" /> Data Health & Automation Monitor
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Monitor automated ingestion pipeline status, data provider freshness, and execution audit logs.
          </p>
        </div>

        <button
          onClick={handleTriggerSync}
          disabled={isSyncing}
          className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing Data Pipeline...' : 'Trigger Manual Data Sync'}
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Active IPOs</span>
          <span className="text-2xl font-black text-gray-900 mt-1 block">{stats.totalIPOs}</span>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">GMP Snapshots Recorded</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">{stats.totalGMPRecords}</span>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Subscription Bids Tracked</span>
          <span className="text-2xl font-black text-purple-700 mt-1 block">{stats.totalSubRecords}</span>
        </div>
      </div>

      {/* Data Sources Health Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm">
        <h2 className="font-extrabold text-base text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
          <Database className="w-4 h-4 text-purple-700" /> Active External Data Sources
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dataSources.map((source) => (
            <div key={source.id} className="bg-gray-50/80 border border-gray-200 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{source.name}</h3>
                  <span className="font-mono text-[10px] text-gray-400">{source.code}</span>
                </div>
                {renderStatusBadge(source.status)}
              </div>

              <div className="text-xs text-gray-500 space-y-1 pt-2 border-t border-gray-200">
                <div className="flex justify-between">
                  <span>Last Success:</span>
                  <strong className="text-gray-800">
                    {source.lastSuccessfulUpdate
                      ? new Date(source.lastSuccessfulUpdate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                      : 'Never'}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span>Refresh Rate:</span>
                  <strong className="text-purple-700">{Math.round(source.refreshIntervalMs / 60000)} mins</strong>
                </div>

                {source.errorMessage && (
                  <div className="text-[11px] text-rose-600 bg-rose-50 p-2 rounded border border-rose-200 mt-2 font-mono">
                    ⚠️ {source.errorMessage}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ingestion Execution Audit Log */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm">
        <h2 className="font-extrabold text-base text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
          <Clock className="w-4 h-4 text-purple-700" /> Recent Ingestion Execution Audit Logs
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Data Provider</th>
                <th className="py-2.5 px-3">Target</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Fetched / Accepted</th>
                <th className="py-2.5 px-3 text-right">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {recentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-purple-50/30 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-[11px]">
                    {new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-gray-900">{log.sourceName}</td>
                  <td className="py-2.5 px-3">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-gray-100 rounded text-purple-700">
                      {log.targetType}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-emerald-600">{log.status}</td>
                  <td className="py-2.5 px-3 font-semibold text-gray-700">
                    {log.recordsFetched} fetched / <span className="text-emerald-600">{log.recordsAccepted} accepted</span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-[11px] text-gray-500">{log.durationMs}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
