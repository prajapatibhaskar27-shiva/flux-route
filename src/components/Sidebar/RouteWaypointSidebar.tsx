import React from 'react';
import { 
  Waypoint, 
  RouteOptimizationResult 
} from '../../types/fluxroute';
import { 
  Clock, 
  MapPin, 
  MoveUp, 
  MoveDown, 
  Trash2, 
  Sparkles, 
  ArrowRight, 
  ShieldAlert, 
  Package, 
  Thermometer, 
  Flame,
  CheckCircle2
} from 'lucide-react';

interface RouteWaypointSidebarProps {
  waypoints: Waypoint[];
  selectedWaypoint: Waypoint | null;
  onSelectWaypoint: (wp: Waypoint) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onRemoveWaypoint: (id: string) => void;
  onOptimize: () => void;
  isOptimizing: boolean;
  optimizationResult: RouteOptimizationResult | null;
  totalDistanceMiles: number;
}

export const RouteWaypointSidebar: React.FC<RouteWaypointSidebarProps> = ({
  waypoints,
  selectedWaypoint,
  onSelectWaypoint,
  onMoveUp,
  onMoveDown,
  onRemoveWaypoint,
  onOptimize,
  isOptimizing,
  optimizationResult,
  totalDistanceMiles
}) => {
  const sortedWaypoints = [...waypoints].sort((a, b) => a.sequenceOrder - b.sequenceOrder);
  const deliveryStops = sortedWaypoints.filter((wp) => wp.type !== 'depot');

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'rush':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800/60">
            <Flame className="w-3 h-3 text-rose-400" />
            RUSH
          </span>
        );
      case 'cold_chain':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60">
            <Thermometer className="w-3 h-3 text-emerald-400" />
            COLD-CHAIN
          </span>
        );
      case 'timed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/60">
            <Clock className="w-3 h-3 text-amber-400" />
            WINDOWED
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded border border-slate-700/60">
            STANDARD
          </span>
        );
    }
  };

  return (
    <div className="w-full lg:w-96 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Route Header Metrics */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Active Dispatch Route
            </span>
            <h2 className="text-base font-bold text-white">
              Metro Corridor #1
            </h2>
          </div>
          <button
            onClick={onOptimize}
            disabled={isOptimizing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 rounded-xl text-xs font-bold shadow-md shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Flux TSP</span>
          </button>
        </div>

        {/* Route Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
          <div className="p-2 bg-slate-900/90 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block font-medium">Total Stops</span>
            <span className="text-sm font-bold text-white font-mono">{deliveryStops.length}</span>
          </div>

          <div className="p-2 bg-slate-900/90 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block font-medium">Circuit Dist</span>
            <span className="text-sm font-bold text-cyan-300 font-mono tabular-nums">
              {totalDistanceMiles} mi
            </span>
          </div>

          <div className="p-2 bg-slate-900/90 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block font-medium">Flux Gain</span>
            <span className="text-sm font-bold text-emerald-400 font-mono tabular-nums">
              +{optimizationResult ? optimizationResult.efficiencyGainPct : 24}%
            </span>
          </div>
        </div>

        {/* Optimization Callout if results available */}
        {optimizationResult && optimizationResult.milesSaved > 0 && (
          <div className="mt-2.5 px-2.5 py-1.5 bg-emerald-950/60 border border-emerald-800/60 rounded-lg flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Optimized: Saved {optimizationResult.milesSaved} mi</span>
            </div>
            <span className="font-mono font-bold text-[11px]">
              -{optimizationResult.co2SavedKg} kg CO₂
            </span>
          </div>
        )}
      </div>

      {/* Scrollable Waypoints List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[580px]">
        {sortedWaypoints.map((wp, index) => {
          const isDepot = wp.type === 'depot';
          const isSelected = selectedWaypoint?.id === wp.id;

          return (
            <div
              key={wp.id}
              onClick={() => onSelectWaypoint(wp)}
              className={`group p-3 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-800/90 border-cyan-500/80 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/40 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  {/* Sequence Badge */}
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                    isDepot
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-800 text-slate-200 border border-slate-700'
                  }`}>
                    {isDepot ? '★' : wp.sequenceOrder}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {wp.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[180px]">
                      {wp.address}
                    </p>
                  </div>
                </div>

                {/* Priority Badge */}
                <div className="shrink-0">
                  {isDepot ? (
                    <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800">
                      ORIGIN
                    </span>
                  ) : (
                    getPriorityBadge(wp.packageDetails.priority)
                  )}
                </div>
              </div>

              {/* Timing & Leg Distance Detail */}
              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>ETA: <strong className="text-cyan-300">{wp.estimatedArrival}</strong></span>
                </div>

                {!isDepot && (
                  <div className="flex items-center gap-2">
                    <span className="tabular-nums">
                      {wp.distanceFromPreviousMiles ? `${wp.distanceFromPreviousMiles} mi` : '—'}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="tabular-nums">
                      {wp.driveTimeFromPreviousMins ? `${wp.driveTimeFromPreviousMins}m` : '—'}
                    </span>
                  </div>
                )}
              </div>

              {/* Reordering & Action Affordances for non-depot items */}
              {!isDepot && (
                <div className="mt-2 pt-1.5 border-t border-slate-800/50 flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveUp(index);
                    }}
                    disabled={index <= 1}
                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors disabled:opacity-30"
                    title="Move Stop Earlier"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveDown(index);
                    }}
                    disabled={index >= sortedWaypoints.length - 1}
                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors disabled:opacity-30"
                    title="Move Stop Later"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveWaypoint(wp.id);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded transition-colors"
                    title="Remove from Route"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
