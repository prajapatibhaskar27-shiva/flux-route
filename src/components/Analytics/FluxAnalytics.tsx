import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Leaf, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Calendar, 
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { FluxEvent } from '../../types/fluxroute';

interface FluxAnalyticsProps {
  events: FluxEvent[];
  totalMilesSaved: number;
  totalCo2SavedKg: number;
}

export const FluxAnalytics: React.FC<FluxAnalyticsProps> = ({
  events,
  totalMilesSaved,
  totalCo2SavedKg
}) => {
  // Hourly distribution mock data
  const hourlyThroughput = [
    { hour: '08:00', completed: 6, delayed: 0 },
    { hour: '09:00', completed: 11, delayed: 1 },
    { hour: '10:00', completed: 14, delayed: 0 },
    { hour: '11:00', completed: 16, delayed: 0 },
    { hour: '12:00', completed: 9, delayed: 1 },
    { hour: '13:00', completed: 15, delayed: 0 },
    { hour: '14:00', completed: 18, delayed: 0 },
    { hour: '15:00', completed: 12, delayed: 0 },
  ];

  const maxDeliveriesInHour = Math.max(...hourlyThroughput.map(h => h.completed));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div>
          <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider block">
            Operational Telemetry · Monthly Rolling Cycle
          </span>
          <h2 className="text-xl font-bold text-white mt-1">
            Flux Routing Efficiency & Carbon Offset
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Continuous combinatorial route optimization and dynamic congestion mitigation
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span>Active Period: Current Dispatch Shift</span>
        </div>
      </div>

      {/* 4 Core Hero KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Distance Saved */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Route Distance Saved</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white tabular-nums">
              {totalMilesSaved.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-cyan-300 font-semibold">mi</span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
            <span>↓ 24.8% vs static sequencing</span>
          </p>
        </div>

        {/* CO2 Emissions Avoided */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Carbon Avoided</span>
            <Leaf className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-emerald-300 tabular-nums">
              {totalCo2SavedKg.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-emerald-400 font-semibold">kg CO₂</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            EPA standard diesel baseline
          </p>
        </div>

        {/* Fuel & Operational Savings */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Direct Fuel Savings</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white tabular-nums">
              ${(totalMilesSaved * 0.42).toFixed(2)}
            </span>
            <span className="text-xs font-mono text-slate-400 font-semibold">USD</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            Based on $4.85/gal commercial rate
          </p>
        </div>

        {/* On-Time SLA Rate */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>On-Time SLA Rate</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-cyan-300 tabular-nums">
              98.8%
            </span>
            <span className="text-xs font-mono text-emerald-400 font-semibold">Nominal</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            99/100 time windows met
          </p>
        </div>
      </div>

      {/* Hourly Dispatch Distribution & Bottleneck Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Chart */}
        <div className="lg:col-span-2 p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-sm">Hourly Delivery Throughput</h3>
              <p className="text-xs text-slate-400 mt-0.5">Completed drop-offs vs schedule delays</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded bg-cyan-400" />
                Completed
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded bg-rose-500" />
                Traffic Incident
              </span>
            </div>
          </div>

          <div className="h-64 mt-6 flex items-end justify-between gap-3 px-2">
            {hourlyThroughput.map((slot) => {
              const heightPct = (slot.completed / maxDeliveriesInHour) * 100;
              return (
                <div key={slot.hour} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-mono text-cyan-300 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    {slot.completed}
                  </span>
                  <div className="w-full max-w-[42px] bg-slate-950 rounded-t-lg overflow-hidden flex flex-col justify-end h-48 border border-slate-800/80">
                    <div
                      className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-md transition-all duration-500"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 font-medium">
                    {slot.hour}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Algorithm Performance Factors */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white text-sm">Flux Algorithm Metrics</h3>
            <p className="text-xs text-slate-400 mt-0.5">Key efficiency contributors</p>

            <div className="mt-5 space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between text-slate-300 font-medium">
                  <span>2-Opt TSP Permutation Efficiency</span>
                  <span className="font-mono text-cyan-300 font-bold">96.4%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full mt-1.5 overflow-hidden border border-slate-800">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: '96.4%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-slate-300 font-medium">
                  <span>Traffic Surge Auto-Bypass</span>
                  <span className="font-mono text-emerald-400 font-bold">89.2%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full mt-1.5 overflow-hidden border border-slate-800">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: '89.2%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-slate-300 font-medium">
                  <span>Cold-Chain Specimen SLA</span>
                  <span className="font-mono text-cyan-300 font-bold">100.0%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full mt-1.5 overflow-hidden border border-slate-800">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-slate-300 font-medium">
                  <span>Fleet Cargo Volume Utilization</span>
                  <span className="font-mono text-amber-400 font-bold">78.5%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full mt-1.5 overflow-hidden border border-slate-800">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '78.5%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 mt-6 text-xs text-slate-400">
            <span className="font-semibold text-slate-200 block mb-1">Autonomous Recalculation Cadence:</span>
            <span>Sensor flux polls every 15 seconds; dynamic detours execute under 180ms latency.</span>
          </div>
        </div>
      </div>

      {/* Dynamic Flux Events Log */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <h3 className="font-bold text-white text-sm mb-3">Live Flux Incidents & Detours Log</h3>
        <div className="divide-y divide-slate-800/80">
          {events.map((ev) => (
            <div key={ev.id} className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 mt-0.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{ev.title}</span>
                    <span className="text-[10px] font-mono text-slate-500">{ev.timestamp}</span>
                  </div>
                  <p className="text-slate-400 mt-0.5 max-w-2xl">{ev.description}</p>
                </div>
              </div>

              {ev.timeSavedByFluxMins && (
                <div className="px-3 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-800 rounded-lg font-mono font-bold">
                  +{ev.timeSavedByFluxMins} mins saved
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
