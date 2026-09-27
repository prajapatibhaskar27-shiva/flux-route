import React, { useState, useEffect } from 'react';
import { FleetVehicle } from '../../types/fluxroute';
import { 
  Gauge, 
  BatteryCharging, 
  Fuel, 
  Activity, 
  Compass, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Maximize2, 
  Minimize2, 
  Radio, 
  Thermometer, 
  Zap,
  Cpu,
  Power
} from 'lucide-react';

interface LiveTelemetryWidgetProps {
  activeVehicle: FleetVehicle;
  isSimulating: boolean;
  simSpeed: number;
  currentStopIndex: number;
  totalStops: number;
  simulatedPos: { lat: number; lng: number } | null;
  nextStopName?: string;
}

export const LiveTelemetryWidget: React.FC<LiveTelemetryWidgetProps> = ({
  activeVehicle,
  isSimulating,
  simSpeed,
  currentStopIndex,
  totalStops,
  simulatedPos,
  nextStopName
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [liveSpeed, setLiveSpeed] = useState<number>(0);
  const [engineRpm, setEngineRpm] = useState<number>(0);
  const [fuelOrBattery, setFuelOrBattery] = useState<number>(activeVehicle.batteryOrFuelPct);
  const [tempC, setTempC] = useState<number>(72);
  const [motorLoadPct, setMotorLoadPct] = useState<number>(0);
  const [tripMiles, setTripMiles] = useState<number>(4.2);

  const isEV = activeVehicle.type === 'ev_van' || activeVehicle.type === 'e_bike';

  // Real-time jitter & dynamic values during simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isSimulating) {
      interval = setInterval(() => {
        // Base speed depending on vehicle type + slight realistic urban fluctuation
        const baseSpeed = activeVehicle.type === 'e_bike' ? 14 : 26;
        const speedVariance = (Math.random() - 0.5) * 4;
        const currentSpeed = Math.max(8, Math.round((baseSpeed + speedVariance) * (simSpeed === 1 ? 1 : simSpeed === 2 ? 1.25 : 1.5)));
        setLiveSpeed(currentSpeed);

        // RPM based on speed
        const rpmBase = isEV ? 4800 : 2100;
        const rpmVariance = (Math.random() - 0.5) * 180;
        setEngineRpm(Math.round(rpmBase + (currentSpeed * 35) + rpmVariance));

        // Motor load
        setMotorLoadPct(Math.min(95, Math.max(30, Math.round(currentSpeed * 1.8 + Math.random() * 8))));

        // Temperature
        setTempC(prev => Math.min(84, Math.max(68, Math.round(prev + (Math.random() - 0.48) * 0.4))));

        // Incremental battery/fuel depletion (very gradual)
        setFuelOrBattery(prev => Math.max(5, parseFloat((prev - 0.02 * simSpeed).toFixed(1))));

        // Trip mileage
        setTripMiles(prev => parseFloat((prev + 0.04 * simSpeed).toFixed(2)));
      }, 500);
    } else {
      // Stopped / idling
      setLiveSpeed(0);
      setEngineRpm(isEV ? 0 : 750); // idle RPM
      setMotorLoadPct(4);
      setTempC(68);
    }

    return () => clearInterval(interval);
  }, [isSimulating, simSpeed, activeVehicle, isEV]);

  // Sync battery if prop changes
  useEffect(() => {
    setFuelOrBattery(activeVehicle.batteryOrFuelPct);
  }, [activeVehicle.batteryOrFuelPct]);

  // Status computation
  const getEngineStatus = () => {
    if (!isSimulating && currentStopIndex === 0) return { label: 'STANDBY (DEPOT)', color: 'text-slate-400 bg-slate-800 border-slate-700' };
    if (!isSimulating) return { label: 'IDLE (AT DOCK)', color: 'text-amber-300 bg-amber-950/80 border-amber-800' };
    return { label: 'ACTIVE DISPATCH', color: 'text-emerald-300 bg-emerald-950/80 border-emerald-800' };
  };

  const status = getEngineStatus();

  return (
    <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 text-slate-100 select-none">
      {/* Header bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-3.5 py-2.5 bg-slate-950/80 border-b border-slate-800 cursor-pointer hover:bg-slate-950 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-tight">Live Telemetry</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 border border-slate-700 font-bold">
                {activeVehicle.callSign}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded-md border uppercase ${status.color}`}>
            {status.label}
          </span>
          <button
            type="button"
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Telemetry Body */}
      {isExpanded ? (
        <div className="p-3.5 space-y-3">
          {/* Main Gauges Grid: Speedometer & Fuel/Battery */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Speedometer Gauge Card */}
            <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-cyan-400" />
                  SPEED
                </span>
                <span className="text-[9px] text-slate-500">LIMIT 35</span>
              </div>

              <div className="my-1.5 flex items-baseline justify-center gap-1">
                <span className="text-3xl font-extrabold font-mono text-white tabular-nums tracking-tight">
                  {liveSpeed}
                </span>
                <span className="text-xs font-mono text-cyan-400 font-semibold">MPH</span>
              </div>

              {/* Linear speed gauge bar */}
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className={`h-full transition-all duration-300 ${
                    liveSpeed > 35 ? 'bg-rose-500' : liveSpeed > 25 ? 'bg-cyan-400' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(100, (liveSpeed / 45) * 100)}%` }}
                />
              </div>
            </div>

            {/* Fuel / Battery Level Card */}
            <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  {isEV ? <Zap className="w-3 h-3 text-emerald-400" /> : <Fuel className="w-3 h-3 text-amber-400" />}
                  {isEV ? 'BATTERY' : 'FUEL TANK'}
                </span>
                <span className="text-[9px] text-slate-500">{isEV ? 'EV PACK' : 'DIESEL'}</span>
              </div>

              <div className="my-1.5 flex items-baseline justify-center gap-1">
                <span className={`text-3xl font-extrabold font-mono tabular-nums tracking-tight ${
                  fuelOrBattery < 20 ? 'text-rose-400' : fuelOrBattery < 40 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {fuelOrBattery}%
                </span>
              </div>

              {/* Fuel progress bar */}
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className={`h-full transition-all duration-500 ${
                    fuelOrBattery < 20 ? 'bg-rose-500' : fuelOrBattery < 40 ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${fuelOrBattery}%` }}
                />
              </div>
            </div>
          </div>

          {/* Engine & Powertrain Micro-Metrics */}
          <div className="grid grid-cols-3 gap-1.5 text-center text-xs font-mono">
            <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/60">
              <span className="text-[9px] text-slate-400 block">ENGINE RPM</span>
              <span className="font-bold text-white text-xs tabular-nums mt-0.5 block">
                {engineRpm.toLocaleString()}
              </span>
            </div>

            <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/60">
              <span className="text-[9px] text-slate-400 block">MOTOR TEMP</span>
              <span className="font-bold text-cyan-300 text-xs tabular-nums mt-0.5 block">
                {tempC}°C
              </span>
            </div>

            <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/60">
              <span className="text-[9px] text-slate-400 block">MOTOR LOAD</span>
              <span className="font-bold text-white text-xs tabular-nums mt-0.5 block">
                {motorLoadPct}%
              </span>
            </div>
          </div>

          {/* Powertrain Diagnostics & Route Context */}
          <div className="p-2 bg-slate-950/90 rounded-xl border border-slate-800 text-[11px] font-mono space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span>CAN-Bus Telemetry:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                DTC: OK (0 FAULTS)
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span>Trip Distance:</span>
              <span className="text-slate-200 font-bold tabular-nums">
                {tripMiles} mi / {activeVehicle.completedStops} of {totalStops} stops
              </span>
            </div>

            {nextStopName && (
              <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/60">
                <span className="text-slate-500">Next Destination:</span>
                <span className="text-cyan-300 font-bold truncate max-w-[140px]">
                  {nextStopName}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Compact Minimized Bar */
        <div className="px-3.5 py-2 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="text-white font-bold tabular-nums">
              {liveSpeed} <span className="text-[10px] text-cyan-400">MPH</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className={`font-bold tabular-nums ${fuelOrBattery < 25 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {fuelOrBattery}% <span className="text-[10px] text-slate-400">{isEV ? 'BATT' : 'FUEL'}</span>
            </span>
          </div>

          <span className="text-[10px] text-slate-400">
            {engineRpm} RPM · {tempC}°C
          </span>
        </div>
      )}
    </div>
  );
};
