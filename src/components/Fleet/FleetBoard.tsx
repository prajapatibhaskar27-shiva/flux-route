import React, { useState } from 'react';
import { FleetVehicle } from '../../types/fluxroute';
import { 
  Truck, 
  BatteryCharging, 
  Battery, 
  User, 
  Phone, 
  MapPin, 
  Gauge, 
  CheckCircle, 
  AlertCircle, 
  Radio, 
  ShieldCheck, 
  ArrowUpRight 
} from 'lucide-react';

interface FleetBoardProps {
  vehicles: FleetVehicle[];
  onSelectVehicle: (vehicle: FleetVehicle) => void;
  activeVehicleId: string;
}

export const FleetBoard: React.FC<FleetBoardProps> = ({
  vehicles,
  onSelectVehicle,
  activeVehicleId
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [callSignSearch, setCallSignSearch] = useState<string>('');

  const filteredVehicles = vehicles.filter((v) => {
    const matchesType = filterType === 'all' || v.type === filterType;
    const matchesSearch = v.name.toLowerCase().includes(callSignSearch.toLowerCase()) ||
                          v.callSign.toLowerCase().includes(callSignSearch.toLowerCase()) ||
                          v.driverName.toLowerCase().includes(callSignSearch.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalActive = vehicles.filter((v) => v.status === 'en_route').length;
  const avgBattery = Math.round(vehicles.reduce((acc, v) => acc + v.batteryOrFuelPct, 0) / vehicles.length);
  const totalCargoKg = vehicles.reduce((acc, v) => acc + v.currentLoadKg, 0);

  const getVehicleTypeIcon = (type: string) => {
    switch (type) {
      case 'e_bike':
        return '🚲';
      case 'heavy_truck':
        return '🚛';
      case 'cargo_sprinter':
        return '🚐';
      default:
        return '⚡🚐';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_route':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'charging':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'loading':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Fleet Top Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
          <span className="text-xs text-slate-400 block font-medium">Fleet Size</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">{vehicles.length}</span>
            <span className="text-xs text-emerald-400 font-medium">100% Operational</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
          <span className="text-xs text-slate-400 block font-medium">Active En Route</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-cyan-300 tabular-nums">{totalActive}</span>
            <span className="text-xs text-slate-400">units in motion</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
          <span className="text-xs text-slate-400 block font-medium">Fleet Energy Average</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">{avgBattery}%</span>
            <span className="text-xs text-slate-400">EV/Fuel Reserve</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
          <span className="text-xs text-slate-400 block font-medium">Live Freight in Transit</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {totalCargoKg.toLocaleString()} kg
            </span>
            <span className="text-xs text-slate-400">payload load</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          {[
            { id: 'all', label: 'All Fleet' },
            { id: 'ev_van', label: 'Electric Vans' },
            { id: 'cargo_sprinter', label: 'Sprinters' },
            { id: 'e_bike', label: 'Cargo Bikes' },
            { id: 'heavy_truck', label: 'Heavy Trucks' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                filterType === tab.id
                  ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={callSignSearch}
          onChange={(e) => setCallSignSearch(e.target.value)}
          placeholder="Filter by vehicle, call sign, or driver..."
          className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-full sm:w-64"
        />
      </div>

      {/* Vehicle Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {filteredVehicles.map((veh) => {
          const isSelected = activeVehicleId === veh.id;
          const loadPct = Math.round((veh.currentLoadKg / veh.maxCapacityKg) * 100);

          return (
            <div
              key={veh.id}
              className={`p-5 rounded-2xl border transition-all ${
                isSelected
                  ? 'bg-slate-900 border-cyan-500 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    {getVehicleTypeIcon(veh.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base">{veh.name}</h3>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-800 text-cyan-300 rounded border border-slate-700">
                        {veh.callSign}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{veh.model} · {veh.licensePlate}</p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border uppercase ${getStatusColor(veh.status)}`}>
                  {veh.status.replace('_', ' ')}
                </span>
              </div>

              {/* Driver & Telemetry Details */}
              <div className="grid grid-cols-2 gap-3 mt-4 p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Assigned Courier</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-5 h-5 rounded-full bg-cyan-600/30 border border-cyan-500/50 flex items-center justify-center text-[10px] text-cyan-300 font-bold">
                      {veh.driverName.charAt(0)}
                    </div>
                    <span className="text-white font-medium">{veh.driverName}</span>
                  </div>
                  <a href={`tel:${veh.driverPhone}`} className="text-[11px] text-slate-400 hover:text-cyan-400 mt-0.5 block font-mono">
                    {veh.driverPhone}
                  </a>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Active Mission Route</span>
                  <span className="text-cyan-300 font-mono text-xs font-semibold block mt-1">
                    {veh.assignedRouteId}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5 font-mono">
                    {veh.speedMph} mph · Heading {veh.headingDeg}°
                  </span>
                </div>
              </div>

              {/* Progress & Metrics */}
              <div className="mt-4 space-y-3 text-xs">
                {/* Battery / Fuel */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Battery className="w-3.5 h-3.5 text-cyan-400" />
                      Energy Reserve
                    </span>
                    <span className="font-mono font-bold text-white tabular-nums">
                      {veh.batteryOrFuelPct}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full ${
                        veh.batteryOrFuelPct < 25 ? 'bg-rose-500' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${veh.batteryOrFuelPct}%` }}
                    />
                  </div>
                </div>

                {/* Cargo Capacity */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Cargo Payload ({veh.currentLoadKg} kg / {veh.maxCapacityKg} kg)</span>
                    <span className="font-mono font-bold text-slate-300 tabular-nums">{loadPct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-cyan-400"
                      style={{ width: `${loadPct}%` }}
                    />
                  </div>
                </div>

                {/* Delivery Stops Completed */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                  <span className="text-slate-400">
                    Route Completion: <strong className="text-white font-mono">{veh.completedStops}</strong> of {veh.totalStops} stops
                  </span>
                  <button
                    onClick={() => onSelectVehicle(veh)}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                  >
                    <span>Inspect On Map</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
