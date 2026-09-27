import React, { useState } from 'react';
import { Waypoint } from '../../types/fluxroute';
import { 
  Search, 
  Filter, 
  Download, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Package, 
  FileText, 
  ExternalLink,
  Flame,
  Thermometer
} from 'lucide-react';

interface DeliveriesManifestProps {
  waypoints: Waypoint[];
  onUpdateStatus: (id: string, newStatus: Waypoint['status']) => void;
  onOpenCustomerView: (wp: Waypoint) => void;
}

export const DeliveriesManifest: React.FC<DeliveriesManifestProps> = ({
  waypoints,
  onUpdateStatus,
  onOpenCustomerView
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const deliveryStops = waypoints.filter((wp) => wp.type !== 'depot');

  const filteredStops = deliveryStops.filter((wp) => {
    const matchesSearch =
      wp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wp.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wp.recipient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wp.packageDetails.trackingId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = priorityFilter === 'all' || wp.packageDetails.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || wp.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const handleExportCSV = () => {
    const headers = ['Sequence', 'TrackingID', 'Recipient', 'Address', 'TimeWindow', 'ETA', 'WeightKg', 'Priority', 'Status'];
    const rows = filteredStops.map((wp) => [
      wp.sequenceOrder,
      wp.packageDetails.trackingId,
      `"${wp.recipient.name}"`,
      `"${wp.address}, ${wp.city}"`,
      `"${wp.timeWindow.start} - ${wp.timeWindow.end}"`,
      wp.estimatedArrival,
      wp.packageDetails.weightKg,
      wp.packageDetails.priority,
      wp.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fluxroute_manifest_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'rush':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/60">
            <Flame className="w-3 h-3 text-rose-400" />
            RUSH
          </span>
        );
      case 'cold_chain':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
            <Thermometer className="w-3 h-3 text-emerald-400" />
            COLD-CHAIN
          </span>
        );
      case 'timed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
            <Clock className="w-3 h-3 text-amber-400" />
            WINDOWED
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/60">
            STANDARD
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
            <CheckCircle className="w-3 h-3" />
            DELIVERED
          </span>
        );
      case 'in_transit':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
            <Clock className="w-3 h-3 animate-spin" />
            EN ROUTE
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            PENDING
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search manifest by tracking ID, recipient, address..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Priority Segmented Filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
          {[
            { id: 'all', label: 'All Priorities' },
            { id: 'rush', label: 'Rush' },
            { id: 'cold_chain', label: 'Cold-Chain' },
            { id: 'timed', label: 'Windowed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPriorityFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                priorityFilter === tab.id
                  ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Export Action */}
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Export Manifest (CSV)</span>
        </button>
      </div>

      {/* High Density Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono">
              <tr>
                <th className="py-3 px-4 font-semibold">SEQ</th>
                <th className="py-3 px-4 font-semibold">TRACKING ID</th>
                <th className="py-3 px-4 font-semibold">DESTINATION & RECIPIENT</th>
                <th className="py-3 px-4 font-semibold">WINDOW</th>
                <th className="py-3 px-4 font-semibold">EST. ARRIVAL</th>
                <th className="py-3 px-4 font-semibold">PAYLOAD</th>
                <th className="py-3 px-4 font-semibold">PRIORITY</th>
                <th className="py-3 px-4 font-semibold">STATUS</th>
                <th className="py-3 px-4 font-semibold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredStops.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p className="font-medium">No deliveries match this search query</p>
                    <p className="text-[11px] text-slate-500 mt-1">Try clearing filters or search terms</p>
                  </td>
                </tr>
              ) : (
                filteredStops.map((wp) => (
                  <tr key={wp.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Seq */}
                    <td className="py-3 px-4 font-mono font-bold text-cyan-300">
                      #{wp.sequenceOrder}
                    </td>

                    {/* Tracking ID */}
                    <td className="py-3 px-4 font-mono font-medium text-slate-200">
                      {wp.packageDetails.trackingId}
                    </td>

                    {/* Recipient */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{wp.name}</div>
                      <div className="text-[11px] text-slate-400">{wp.address} · {wp.recipient.name}</div>
                    </td>

                    {/* Window */}
                    <td className="py-3 px-4 font-mono text-slate-300 tabular-nums">
                      {wp.timeWindow.start} - {wp.timeWindow.end}
                    </td>

                    {/* ETA */}
                    <td className="py-3 px-4 font-mono font-bold text-cyan-300 tabular-nums">
                      {wp.estimatedArrival}
                    </td>

                    {/* Payload */}
                    <td className="py-3 px-4 font-mono text-slate-300 tabular-nums">
                      {wp.packageDetails.weightKg} kg
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-4">
                      {getPriorityBadge(wp.packageDetails.priority)}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {getStatusBadge(wp.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenCustomerView(wp)}
                          className="px-2.5 py-1 text-[11px] font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
                          title="Preview Customer Live Tracking Link"
                        >
                          <ExternalLink className="w-3 h-3 text-cyan-400" />
                          <span>Track</span>
                        </button>

                        {wp.status !== 'delivered' && (
                          <button
                            onClick={() => onUpdateStatus(wp.id, 'delivered')}
                            className="px-2.5 py-1 text-[11px] font-semibold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/80 rounded-lg transition-colors"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
