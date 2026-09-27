import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Zap, 
  AlertTriangle, 
  Flame, 
  BatteryWarning, 
  Clock, 
  Sliders, 
  Sparkles 
} from 'lucide-react';
import { FleetVehicle, Waypoint, FluxEvent } from '../../types/fluxroute';

interface SimulationControlsProps {
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onResetSimulation: () => void;
  simSpeed: number;
  onChangeSpeed: (speed: number) => void;
  currentStopIndex: number;
  totalStops: number;
  activeVehicle: FleetVehicle;
  onInjectFluxEvent: (eventType: FluxEvent['type']) => void;
  recentEvent: FluxEvent | null;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  isSimulating,
  onToggleSimulation,
  onResetSimulation,
  simSpeed,
  onChangeSpeed,
  currentStopIndex,
  totalStops,
  activeVehicle,
  onInjectFluxEvent,
  recentEvent
}) => {
  const [showEventMenu, setShowEventMenu] = useState(false);

  const progressPct = totalStops > 0 ? Math.min(100, Math.round((currentStopIndex / totalStops) * 100)) : 0;

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
      {/* Top Row: Playback Controls & Vehicle Telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSimulation}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-98 ${
              isSimulating
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
            }`}
          >
            {isSimulating ? (
              <>
                <Pause className="w-4 h-4 fill-slate-950" />
                <span>Pause Simulation</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Simulate Route Run</span>
              </>
            )}
          </button>

          <button
            onClick={onResetSimulation}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-colors border border-slate-700/60"
            title="Reset Simulation to Depot"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed Selectors */}
          <div className="flex items-center bg-slate-950 rounded-xl p-1 border border-slate-800">
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => onChangeSpeed(spd)}
                className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-colors ${
                  simSpeed === spd
                    ? 'bg-slate-800 text-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Telemetry Chips */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-sans">Active Unit:</span>
            <span className="text-cyan-300 font-bold">{activeVehicle.callSign}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-sans">Speed:</span>
            <span className="text-white font-bold tabular-nums">
              {isSimulating ? activeVehicle.speedMph * simSpeed : 0} mph
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-sans">Power/Battery:</span>
            <span className={`font-bold tabular-nums ${activeVehicle.batteryOrFuelPct < 25 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {activeVehicle.batteryOrFuelPct}%
            </span>
          </div>

          {/* Inject Dynamic Flux Event Button */}
          <div className="relative">
            <button
              onClick={() => setShowEventMenu(!showEventMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-950 to-indigo-950 hover:from-purple-900 hover:to-indigo-900 text-purple-300 border border-purple-700/60 rounded-xl text-xs font-semibold transition-all shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>Inject Flux Scenario</span>
            </button>

            {/* Event Dropdown Menu */}
            {showEventMenu && (
              <div className="absolute right-0 bottom-full mb-2 w-72 bg-slate-900 border border-purple-700/60 rounded-xl shadow-2xl p-2 z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1 text-[11px] font-mono text-purple-300 font-bold uppercase tracking-wider border-b border-slate-800">
                  Simulate Real-World Flux Event
                </div>
                <div className="mt-1 space-y-1">
                  <button
                    onClick={() => {
                      onInjectFluxEvent('traffic_surge');
                      setShowEventMenu(false);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-800/80 transition-colors flex items-start gap-2 text-xs text-slate-200"
                  >
                    <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block text-amber-300">Surge Traffic on US-101</span>
                      <span className="text-[11px] text-slate-400 block">Detects sudden bottleneck, triggers dynamic detour</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onInjectFluxEvent('rush_order_inserted');
                      setShowEventMenu(false);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-800/80 transition-colors flex items-start gap-2 text-xs text-slate-200"
                  >
                    <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block text-cyan-300">Rush Specimen Pickup</span>
                      <span className="text-[11px] text-slate-400 block">Inserts priority stop with zero detour overhead</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onInjectFluxEvent('road_closure');
                      setShowEventMenu(false);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-800/80 transition-colors flex items-start gap-2 text-xs text-slate-200"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block text-rose-300">City Utility Road Closure</span>
                      <span className="text-[11px] text-slate-400 block">Simulates street closure and immediate reroute</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onInjectFluxEvent('battery_low');
                      setShowEventMenu(false);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-800/80 transition-colors flex items-start gap-2 text-xs text-slate-200"
                  >
                    <BatteryWarning className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block text-emerald-300">Low EV Range Trigger</span>
                      <span className="text-[11px] text-slate-400 block">Schedules fast DC charger waypoint on route</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Route Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">
            Route Progress: Stop <span className="text-white font-bold">{currentStopIndex}</span> of <span className="text-white">{totalStops}</span>
          </span>
          <span className="text-cyan-400 font-bold tabular-nums">{progressPct}% Complete</span>
        </div>
        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Recent Flux Event Banner Notification */}
      {recentEvent && (
        <div className="flex items-center justify-between px-3 py-2 bg-slate-950/80 border border-cyan-800/60 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-mono text-cyan-300 font-bold uppercase">{recentEvent.title}:</span>
            <span className="text-slate-300">{recentEvent.description}</span>
          </div>
          {recentEvent.timeSavedByFluxMins && (
            <div className="px-2 py-0.5 bg-emerald-950/80 text-emerald-300 border border-emerald-800 rounded font-mono font-bold text-[11px] whitespace-nowrap">
              Saved {recentEvent.timeSavedByFluxMins}m via Flux TSP
            </div>
          )}
        </div>
      )}
    </div>
  );
};
