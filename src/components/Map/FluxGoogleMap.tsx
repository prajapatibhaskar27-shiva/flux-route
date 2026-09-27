import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Polyline, 
  useMap,
  useApiLoadingStatus,
  APILoadingStatus
} from '@vis.gl/react-google-maps';
import { Waypoint, FleetVehicle } from '../../types/fluxroute';
import { LiveTelemetryWidget } from './LiveTelemetryWidget';
import { 
  Layers, 
  MapPin, 
  Maximize2, 
  Clock, 
  Phone, 
  X, 
  Truck, 
  Navigation,
  Compass,
  CheckCircle2,
  Sparkles,
  Flame,
  Thermometer,
  LocateFixed,
  Zap,
  Radio,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  ExternalLink,
  Key,
  RefreshCw
} from 'lucide-react';

interface FluxGoogleMapProps {
  waypoints: Waypoint[];
  activeVehicle: FleetVehicle;
  simulationProgressPct: number;
  simulatedVehiclePos: { lat: number; lng: number } | null;
  onSelectWaypoint: (waypoint: Waypoint) => void;
  selectedWaypoint: Waypoint | null;
  trafficLevel: 'low' | 'moderate' | 'heavy';
  isSimulating?: boolean;
  simSpeed?: number;
  currentStopIndex?: number;
  mapEngine: 'google' | 'leaflet';
  onChangeMapEngine: (engine: 'google' | 'leaflet') => void;
}

// Google Maps Dark Mode Styling JSON
const DARK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cbd5e1' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#142533' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#334155' }]
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cbd5e1' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#0369a1' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0284c7' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#e0f2fe' }]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }]
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#020617' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#0284c7' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#020617' }]
  }
];

// Inner Controller component for Map Camera and Real-time Traffic Layer
const MapCameraController: React.FC<{
  waypoints: Waypoint[];
  vehiclePos: { lat: number; lng: number };
  autoFollow: boolean;
  showTraffic: boolean;
}> = ({ waypoints, vehiclePos, autoFollow, showTraffic }) => {
  const map = useMap();
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);

  // Manage Google Maps Live Traffic Layer
  useEffect(() => {
    if (!map) return;

    if (showTraffic) {
      if (!trafficLayerRef.current) {
        trafficLayerRef.current = new google.maps.TrafficLayer();
      }
      trafficLayerRef.current.setMap(map);
    } else {
      if (trafficLayerRef.current) {
        trafficLayerRef.current.setMap(null);
      }
    }

    return () => {
      if (trafficLayerRef.current) {
        trafficLayerRef.current.setMap(null);
      }
    };
  }, [map, showTraffic]);

  // Auto-follow vehicle
  useEffect(() => {
    if (!map || !autoFollow) return;
    map.panTo(vehiclePos);
  }, [map, vehiclePos, autoFollow]);

  return null;
};

// Internal status observer
const ApiStatusWatcher: React.FC<{
  onStatusChange: (status: APILoadingStatus) => void;
}> = ({ onStatusChange }) => {
  const status = useApiLoadingStatus();

  useEffect(() => {
    onStatusChange(status);
  }, [status, onStatusChange]);

  return null;
};

export const FluxGoogleMap: React.FC<FluxGoogleMapProps> = ({
  waypoints,
  activeVehicle,
  simulationProgressPct,
  simulatedVehiclePos,
  onSelectWaypoint,
  selectedWaypoint,
  trafficLevel,
  isSimulating = false,
  simSpeed = 1,
  currentStopIndex = 0,
  mapEngine,
  onChangeMapEngine
}) => {
  const [customKey, setCustomKey] = useState<string>(() => {
    return localStorage.getItem('flux_custom_gmaps_key') || 
      (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDOkUjTrdXZiLmKihqI4HtyqxIgEM_qbPQ');
  });
  const apiKey = customKey;

  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');
  const [useDarkTheme, setUseDarkTheme] = useState<boolean>(true);
  const [showTraffic, setShowTraffic] = useState<boolean>(true);
  const [autoFollow, setAutoFollow] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isConfiguringKey, setIsConfiguringKey] = useState(false);
  const [inputKey, setInputKey] = useState(customKey);

  // Monitor Google Maps auth errors (e.g. ApiNotActivatedMapError)
  useEffect(() => {
    const handleAuthError = () => {
      console.warn('Google Maps API Error: ApiNotActivatedMapError or AuthFailure');
      setAuthError('ApiNotActivatedMapError');
    };

    (window as any).gm_authFailure = handleAuthError;

    return () => {
      if ((window as any).gm_authFailure === handleAuthError) {
        delete (window as any).gm_authFailure;
      }
    };
  }, []);

  const handleStatusChange = useCallback((status: APILoadingStatus) => {
    if (status === APILoadingStatus.FAILED) {
      setAuthError('ApiNotActivatedMapError');
    }
  }, []);

  // Sorted waypoints
  const sortedWaypoints = useMemo(() => {
    return [...waypoints].sort((a, b) => a.sequenceOrder - b.sequenceOrder);
  }, [waypoints]);

  // Current vehicle coordinate
  const currentVehicleCoords = useMemo(() => {
    if (simulatedVehiclePos) {
      return { lat: simulatedVehiclePos.lat, lng: simulatedVehiclePos.lng };
    }
    return { lat: activeVehicle.currentLocation.lat, lng: activeVehicle.currentLocation.lng };
  }, [simulatedVehiclePos, activeVehicle]);

  // Polyline path array
  const polylinePath = useMemo(() => {
    return sortedWaypoints.map((wp) => ({ lat: wp.lat, lng: wp.lng }));
  }, [sortedWaypoints]);

  // Next stop
  const nextStop = useMemo(() => {
    if (sortedWaypoints.length === 0) return null;
    if (currentStopIndex < sortedWaypoints.length) {
      return sortedWaypoints[currentStopIndex];
    }
    return sortedWaypoints[sortedWaypoints.length - 1];
  }, [sortedWaypoints, currentStopIndex]);

  // Center coordinate
  const defaultCenter = useMemo(() => {
    if (waypoints.length > 0) {
      return { lat: waypoints[0].lat, lng: waypoints[0].lng };
    }
    return { lat: 37.7749, lng: -122.4194 };
  }, [waypoints]);

  return (
    <div className="relative w-full h-[620px] rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
      <APIProvider apiKey={apiKey}>
        <ApiStatusWatcher onStatusChange={handleStatusChange} />
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={13}
          mapTypeId={mapType}
          styles={useDarkTheme && mapType === 'roadmap' ? DARK_MAP_STYLE : undefined}
          disableDefaultUI={true}
          gestureHandling="greedy"
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          className="w-full h-full"
        >
          <MapCameraController
            waypoints={waypoints}
            vehiclePos={currentVehicleCoords}
            autoFollow={autoFollow}
            showTraffic={showTraffic}
          />

          {/* Polyline: Glow Halo */}
          {polylinePath.length > 1 && (
            <Polyline
              path={polylinePath}
              strokeColor="#0891b2"
              strokeOpacity={0.4}
              strokeWeight={7}
            />
          )}

          {/* Polyline: Sharp Circuit */}
          {polylinePath.length > 1 && (
            <Polyline
              path={polylinePath}
              strokeColor="#22d3ee"
              strokeOpacity={0.95}
              strokeWeight={3.5}
            />
          )}

          {/* Depot & Delivery Stop Markers */}
          {sortedWaypoints.map((wp) => {
            const isDepot = wp.type === 'depot';
            const isSelected = selectedWaypoint?.id === wp.id;
            const isDelivered = wp.status === 'delivered';

            return (
              <AdvancedMarker
                key={wp.id}
                position={{ lat: wp.lat, lng: wp.lng }}
                title={`${wp.name} - ${wp.packageDetails.priority}`}
                onClick={() => onSelectWaypoint(wp)}
              >
                {isDepot ? (
                  /* Depot Marker */
                  <div className={`relative flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-110 ${
                    isSelected ? 'scale-115' : ''
                  }`}>
                    <div className="absolute -inset-1.5 rounded-full bg-cyan-500/30 animate-ping" />
                    <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-xl shadow-cyan-500/40 border-2 border-white/90">
                      <Truck className="w-5 h-5" />
                    </div>
                    <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded bg-slate-900/90 text-[10px] font-mono font-bold text-cyan-300 border border-cyan-800 shadow-md">
                      DEPOT HUB
                    </span>
                  </div>
                ) : (
                  /* Delivery Node Marker */
                  <div className={`relative flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-115 ${
                    isSelected ? 'scale-120' : ''
                  }`}>
                    {wp.packageDetails.priority === 'rush' && (
                      <div className="absolute -inset-1 rounded-full bg-rose-500/40 animate-pulse" />
                    )}

                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs shadow-xl border-2 transition-colors ${
                      isDelivered 
                        ? 'bg-slate-800 text-emerald-400 border-emerald-500' 
                        : wp.packageDetails.priority === 'rush'
                        ? 'bg-rose-600 text-white border-white shadow-rose-600/50'
                        : wp.packageDetails.priority === 'cold_chain'
                        ? 'bg-emerald-600 text-white border-white shadow-emerald-600/50'
                        : wp.packageDetails.priority === 'timed'
                        ? 'bg-amber-600 text-white border-white shadow-amber-600/50'
                        : 'bg-cyan-600 text-white border-white shadow-cyan-600/50'
                    }`}>
                      {isDelivered ? '✓' : wp.sequenceOrder}
                    </div>

                    <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap px-1 py-0.2 rounded bg-slate-950/80 text-[9px] font-mono text-slate-300 border border-slate-800 pointer-events-none">
                      #{wp.sequenceOrder}
                    </span>
                  </div>
                )}
              </AdvancedMarker>
            );
          })}

          {/* Active Moving Vehicle Marker */}
          <AdvancedMarker
            position={currentVehicleCoords}
            title={`${activeVehicle.callSign} (${activeVehicle.driverName})`}
          >
            <div className="relative flex items-center justify-center pointer-events-none">
              <div className="absolute -inset-2.5 rounded-full bg-emerald-400/30 animate-ping" />
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-2xl shadow-emerald-500/50 border-2 border-white">
                <Navigation className="w-5 h-5 fill-slate-950 animate-pulse" />
              </div>
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-lg bg-slate-950 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-700/80 shadow-lg">
                {activeVehicle.callSign} · {activeVehicle.batteryOrFuelPct}%
              </div>
            </div>
          </AdvancedMarker>
        </Map>
      </APIProvider>

      {/* Top Floating Bar: Engine Toggle, Google Maps Layer Options & Real-time Telemetry Controls */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left Side: Brand Status & Engine Switcher */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          {/* Active Engine Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-cyan-800/80 shadow-xl">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                authError ? 'bg-amber-400' : 'bg-cyan-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                authError ? 'bg-amber-500' : 'bg-cyan-500'
              }`} />
            </span>
            <span className="text-xs font-mono font-bold text-white tracking-wide">
              Google Maps Platform
            </span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
              authError
                ? 'bg-amber-950/80 text-amber-300 border border-amber-700/60'
                : 'bg-cyan-950 text-cyan-300 border border-cyan-700/60'
            }`}>
              {authError ? 'ACTIVATION REQUIRED' : 'CONNECTED'}
            </span>
          </div>

          {/* Engine Toggle (Google Maps vs Leaflet) */}
          <div className="flex items-center bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-1 shadow-xl text-xs font-mono">
            <button
              onClick={() => onChangeMapEngine('google')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                mapEngine === 'google'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Google Maps
            </button>
            <button
              onClick={() => onChangeMapEngine('leaflet')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                mapEngine === 'leaflet'
                  ? 'bg-slate-800 text-cyan-300 shadow-md border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Leaflet / OSM
            </button>
          </div>

          {/* Key Settings Toggle */}
          <button
            onClick={() => setIsConfiguringKey(!isConfiguringKey)}
            className={`p-2 rounded-2xl border backdrop-blur-md transition-all shadow-xl text-xs font-mono flex items-center gap-1.5 ${
              isConfiguringKey || authError
                ? 'bg-amber-950/80 border-amber-700/80 text-amber-300'
                : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Configure Google Maps API Key"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Key Settings</span>
          </button>

          {/* Live Google Traffic Toggle */}
          <button
            onClick={() => setShowTraffic(!showTraffic)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-xs font-mono font-medium backdrop-blur-md transition-all shadow-xl ${
              showTraffic
                ? 'bg-emerald-950/90 border-emerald-700 text-emerald-300'
                : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Toggle Google Maps Live Real-Time Traffic Layer"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Traffic: {showTraffic ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Right Side: Map Type Switchers & Camera Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Map Style Switcher */}
          <div className="flex items-center bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-1 shadow-xl text-xs font-mono">
            <button
              onClick={() => { setMapType('roadmap'); setUseDarkTheme(true); }}
              className={`px-2.5 py-1 rounded-xl transition-all ${
                mapType === 'roadmap' && useDarkTheme
                  ? 'bg-slate-800 text-cyan-300 font-bold shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => { setMapType('roadmap'); setUseDarkTheme(false); }}
              className={`px-2.5 py-1 rounded-xl transition-all ${
                mapType === 'roadmap' && !useDarkTheme
                  ? 'bg-slate-800 text-cyan-300 font-bold shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => setMapType('satellite')}
              className={`px-2.5 py-1 rounded-xl transition-all ${
                mapType === 'satellite'
                  ? 'bg-slate-800 text-cyan-300 font-bold shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapType('hybrid')}
              className={`px-2.5 py-1 rounded-xl transition-all ${
                mapType === 'hybrid'
                  ? 'bg-slate-800 text-cyan-300 font-bold shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Hybrid
            </button>
          </div>

          {/* Auto-follow vehicle toggle */}
          <button
            onClick={() => setAutoFollow(!autoFollow)}
            className={`p-2 rounded-2xl border backdrop-blur-md transition-colors shadow-xl ${
              autoFollow
                ? 'bg-emerald-950/90 border-emerald-700 text-emerald-400'
                : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title={autoFollow ? 'Auto-Following Courier' : 'Enable Courier Auto-Follow'}
          >
            <LocateFixed className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Floating Legend */}
      <div className="absolute bottom-4 left-4 z-[400] flex flex-wrap items-center gap-3 px-3.5 py-2 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 text-[11px] text-slate-300 font-sans shadow-xl">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-md bg-cyan-500" />
          <span>Standard</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-md bg-amber-500" />
          <span>Windowed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-md bg-rose-500" />
          <span>Rush Express</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-md bg-emerald-500" />
          <span>Cold-Chain</span>
        </div>
        <span className="text-slate-600">|</span>
        <div className="flex items-center gap-1.5 text-cyan-300 font-mono font-medium">
          <span className="w-3.5 h-1 bg-cyan-400 rounded-full" />
          <span>Google Routes Polyline</span>
        </div>
      </div>

      {/* Floating Live Telemetry HUD Widget */}
      <div className="absolute bottom-4 right-4 z-[400] w-72 sm:w-80 md:w-84 max-w-[calc(100%-2rem)] pointer-events-auto">
        <LiveTelemetryWidget
          activeVehicle={activeVehicle}
          isSimulating={isSimulating}
          simSpeed={simSpeed}
          currentStopIndex={currentStopIndex}
          totalStops={waypoints.length > 0 ? waypoints.length - 1 : 0}
          simulatedPos={simulatedVehiclePos}
          nextStopName={nextStop?.name}
        />
      </div>

      {/* Slide-over Inspection Drawer for Selected Waypoint */}
      {selectedWaypoint && (
        <div className="absolute top-16 right-4 z-[450] w-88 max-w-[calc(100%-2rem)] bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-3xl shadow-2xl p-5 text-slate-100 animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="flex items-start justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">
                  {selectedWaypoint.type === 'depot' ? 'DEPOT HUB' : `STOP #${selectedWaypoint.sequenceOrder}`}
                </span>
                <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">
                  {selectedWaypoint.packageDetails.priority}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-1 leading-snug">
                {selectedWaypoint.name}
              </h3>
            </div>
            <button
              onClick={() => onSelectWaypoint(null as any)}
              className="p-1 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3.5 space-y-2.5 text-xs">
            <div className="flex items-start gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>{selectedWaypoint.address}, {selectedWaypoint.city}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Delivery Window</span>
              </div>
              <span className="font-semibold text-white">
                {selectedWaypoint.timeWindow.start} - {selectedWaypoint.timeWindow.end}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Est. Arrival</span>
                <span className="font-mono text-cyan-300 font-bold text-sm">
                  {selectedWaypoint.estimatedArrival}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Payload Weight</span>
                <span className="font-mono text-white font-semibold text-xs">
                  {selectedWaypoint.packageDetails.weightKg} kg
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-400 block font-medium">Recipient & Special Notes:</span>
              <p className="text-slate-200 mt-0.5 font-medium">
                {selectedWaypoint.recipient.name} {selectedWaypoint.recipient.company ? `(${selectedWaypoint.recipient.company})` : ''}
              </p>
              {selectedWaypoint.recipient.notes && (
                <p className="text-slate-400 italic text-[11px] mt-1 bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
                  "{selectedWaypoint.recipient.notes}"
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <a
                href={`tel:${selectedWaypoint.recipient.phone}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span>Call Recipient</span>
              </a>
              <div className="px-3 py-2 bg-cyan-950/80 border border-cyan-800 text-cyan-300 rounded-xl text-xs font-mono font-bold">
                {selectedWaypoint.packageDetails.trackingId}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activation Error / Key Diagnostic Overlay */}
      {(authError || isConfiguringKey) && (
        <div className="absolute inset-0 z-[500] bg-slate-950/92 backdrop-blur-md flex items-center justify-center p-4 text-center animate-in fade-in duration-200 pointer-events-auto">
          <div className="max-w-md w-full bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl text-left space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">
                    {authError ? 'Maps JavaScript API Not Activated' : 'Configure Google Maps API Key'}
                  </h3>
                  <p className="text-xs text-amber-400/90 font-mono">
                    {authError || 'Custom Key Configuration'}
                  </p>
                </div>
              </div>
              {isConfiguringKey && !authError && (
                <button
                  onClick={() => setIsConfiguringKey(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {authError ? (
              <>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your Google Cloud API key was received, but the <strong className="text-white">Maps JavaScript API</strong> service is not enabled on your Google Cloud Project.
                </p>

                <div className="bg-slate-950/80 rounded-2xl p-3 border border-slate-800 text-xs text-slate-300 space-y-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                    To Enable in Google Cloud Console:
                  </span>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400">
                    <li>Go to <span className="text-cyan-300 font-mono">APIs & Services &gt; Library</span></li>
                    <li>Search for <span className="text-cyan-300 font-mono">"Maps JavaScript API"</span></li>
                    <li>Click <span className="text-emerald-400 font-bold font-mono">"ENABLE"</span></li>
                  </ol>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-300 leading-relaxed">
                Provide an enabled Google Maps API key with the Maps JavaScript API activated.
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => onChangeMapEngine('leaflet')}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all text-center"
              >
                Use Vector / OSM Engine (Active)
              </button>
              <a
                href="https://console.cloud.google.com/apis/library/maps-backend.googleapis.com"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Console Link</span>
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              </a>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 block mb-1.5">
                Current Key in Use:
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('flux_custom_gmaps_key', inputKey);
                    setCustomKey(inputKey);
                    setAuthError(null);
                    setIsConfiguringKey(false);
                  }}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
