import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Waypoint, FleetVehicle } from '../../types/fluxroute';
import { LiveTelemetryWidget } from './LiveTelemetryWidget';
import { FluxGoogleMap } from './FluxGoogleMap';
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
  LocateFixed
} from 'lucide-react';

interface FluxInteractiveMapProps {
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
  mapEngine?: 'google' | 'leaflet';
  onChangeMapEngine?: (engine: 'google' | 'leaflet') => void;
}

type TileLayerType = 'dark' | 'streets' | 'satellite';

const TILE_LAYERS: Record<TileLayerType, { url: string; attribution: string; maxZoom: number }> = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>, &copy; <a href="https://openstreetmap.org">OSM</a>',
    maxZoom: 19
  },
  streets: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    maxZoom: 19
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP',
    maxZoom: 19
  }
};

export const FluxInteractiveMap: React.FC<FluxInteractiveMapProps> = ({
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
  const [internalEngine, setInternalEngine] = useState<'google' | 'leaflet'>(mapEngine || 'leaflet');
  const activeEngine = mapEngine || internalEngine;

  const handleEngineChange = (engine: 'google' | 'leaflet') => {
    setInternalEngine(engine);
    if (onChangeMapEngine) onChangeMapEngine(engine);
  };

  if (activeEngine === 'google') {
    return (
      <FluxGoogleMap
        waypoints={waypoints}
        activeVehicle={activeVehicle}
        simulationProgressPct={simulationProgressPct}
        simulatedVehiclePos={simulatedVehiclePos}
        onSelectWaypoint={onSelectWaypoint}
        selectedWaypoint={selectedWaypoint}
        trafficLevel={trafficLevel}
        isSimulating={isSimulating}
        simSpeed={simSpeed}
        currentStopIndex={currentStopIndex}
        mapEngine={activeEngine}
        onChangeMapEngine={handleEngineChange}
      />
    );
  }

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const routeHaloPolylineRef = useRef<L.Polyline | null>(null);
  const vehicleMarkerRef = useRef<L.Marker | null>(null);

  const [activeTileType, setActiveTileType] = useState<TileLayerType>('dark');
  const [showTrafficOverlay, setShowTrafficOverlay] = useState<boolean>(true);
  const [autoFollowVehicle, setAutoFollowVehicle] = useState<boolean>(false);

  // Sorted waypoints by sequence order
  const sortedWaypoints = useMemo(() => {
    return [...waypoints].sort((a, b) => a.sequenceOrder - b.sequenceOrder);
  }, [waypoints]);

  // Next target stop during simulation
  const nextStop = useMemo(() => {
    if (sortedWaypoints.length === 0) return null;
    if (currentStopIndex < sortedWaypoints.length) {
      return sortedWaypoints[currentStopIndex];
    }
    return sortedWaypoints[sortedWaypoints.length - 1];
  }, [sortedWaypoints, currentStopIndex]);

  // Current active coordinates of vehicle
  const currentVehicleCoords = useMemo(() => {
    if (simulatedVehiclePos) {
      return [simulatedVehiclePos.lat, simulatedVehiclePos.lng] as [number, number];
    }
    return [activeVehicle.currentLocation.lat, activeVehicle.currentLocation.lng] as [number, number];
  }, [simulatedVehiclePos, activeVehicle]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter: [number, number] = waypoints.length > 0 
        ? [waypoints[0].lat, waypoints[0].lng] 
        : [37.7749, -122.4194];

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 13,
        zoomControl: false,
        attributionControl: false
      });

      // Add base tile layer
      const baseTile = L.tileLayer(TILE_LAYERS[activeTileType].url, {
        attribution: TILE_LAYERS[activeTileType].attribution,
        maxZoom: TILE_LAYERS[activeTileType].maxZoom
      }).addTo(map);

      tileLayerRef.current = baseTile;

      // Layer groups for markers
      const markerGroup = L.layerGroup().addTo(map);
      markersLayerGroupRef.current = markerGroup;

      mapInstanceRef.current = map;

      // Fit bounds if waypoints exist
      if (waypoints.length > 1) {
        const bounds = L.latLngBounds(waypoints.map(w => [w.lat, w.lng]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }

    return () => {
      // Map cleanup on total component teardown
    };
  }, []);

  // Handle Tile Type Change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const newTile = L.tileLayer(TILE_LAYERS[activeTileType].url, {
      attribution: TILE_LAYERS[activeTileType].attribution,
      maxZoom: TILE_LAYERS[activeTileType].maxZoom
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newTile;
  }, [activeTileType]);

  // Update Route Polyline & Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerGroupRef.current) return;

    const map = mapInstanceRef.current;
    const markerGroup = markersLayerGroupRef.current;

    // Clear old markers
    markerGroup.clearLayers();

    // Remove existing polylines
    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }
    if (routeHaloPolylineRef.current) {
      map.removeLayer(routeHaloPolylineRef.current);
      routeHaloPolylineRef.current = null;
    }

    const latLngs = sortedWaypoints.map(w => [w.lat, w.lng] as [number, number]);

    // Draw route polylines if 2+ waypoints
    if (latLngs.length >= 2) {
      // Ambient glow polyline
      const halo = L.polyline(latLngs, {
        color: '#06b6d4',
        weight: 8,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);
      routeHaloPolylineRef.current = halo;

      // Core animated dashed polyline
      const line = L.polyline(latLngs, {
        color: '#38bdf8',
        weight: 3.5,
        opacity: 0.9,
        dashArray: '10, 8',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);
      routePolylineRef.current = line;
    }

    // Render Markers for Waypoints
    sortedWaypoints.forEach((wp) => {
      const isDepot = wp.type === 'depot';
      const isSelected = selectedWaypoint?.id === wp.id;

      // Color coding
      let badgeBg = 'bg-cyan-500 text-slate-950 border-cyan-400';
      if (isDepot) {
        badgeBg = 'bg-slate-950 text-cyan-300 border-cyan-400 ring-4 ring-cyan-500/20';
      } else if (wp.packageDetails.priority === 'rush') {
        badgeBg = 'bg-rose-500 text-white border-rose-400 ring-2 ring-rose-500/40';
      } else if (wp.packageDetails.priority === 'cold_chain') {
        badgeBg = 'bg-emerald-500 text-slate-950 border-emerald-400 ring-2 ring-emerald-500/40';
      } else if (wp.packageDetails.priority === 'timed') {
        badgeBg = 'bg-amber-500 text-slate-950 border-amber-400 ring-2 ring-amber-500/40';
      }

      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-125">
          ${isSelected ? '<div class="absolute w-10 h-10 rounded-full border-2 border-dashed border-cyan-300 animate-spin"></div>' : ''}
          <div class="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-mono font-bold border shadow-xl ${badgeBg}">
            ${isDepot ? '★' : wp.sequenceOrder}
          </div>
          <div class="absolute -bottom-4 px-1.5 py-0.2 bg-slate-950/90 text-[9px] font-sans font-medium text-slate-200 rounded border border-slate-800 whitespace-nowrap shadow-md pointer-events-none">
            ${wp.name.length > 15 ? wp.name.substring(0, 13) + '..' : wp.name}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: iconHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([wp.lat, wp.lng], { icon: customIcon }).addTo(markerGroup);

      marker.on('click', () => {
        onSelectWaypoint(wp);
      });
    });

  }, [sortedWaypoints, selectedWaypoint]);

  // Update Moving Vehicle Marker on Map
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const vehicleHtml = `
      <div class="relative flex items-center justify-center pointer-events-none">
        <div class="absolute w-12 h-12 rounded-full bg-cyan-500/20 animate-ping" style="animation-duration: 2.5s;"></div>
        <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 border-2 border-white shadow-2xl flex items-center justify-center text-white text-xs">
          <svg viewBox="0 0 24 24" class="w-4 h-4 fill-white" style="transform: rotate(${activeVehicle.headingDeg}deg);">
            <polygon points="12,2 22,22 12,18 2,22" />
          </svg>
        </div>
        <div class="absolute -top-5 px-1.5 py-0.5 bg-slate-900/95 text-cyan-300 font-mono text-[9px] font-bold rounded border border-cyan-800 shadow-lg whitespace-nowrap">
          ${activeVehicle.callSign}
        </div>
      </div>
    `;

    const vehicleIcon = L.divIcon({
      className: 'custom-vehicle-marker',
      html: vehicleHtml,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    if (!vehicleMarkerRef.current) {
      const marker = L.marker(currentVehicleCoords, { icon: vehicleIcon, zIndexOffset: 1000 }).addTo(map);
      vehicleMarkerRef.current = marker;
    } else {
      vehicleMarkerRef.current.setLatLng(currentVehicleCoords);
      vehicleMarkerRef.current.setIcon(vehicleIcon);
    }

    if (autoFollowVehicle) {
      map.panTo(currentVehicleCoords, { animate: true, duration: 0.5 });
    }
  }, [currentVehicleCoords, activeVehicle.headingDeg, activeVehicle.callSign, autoFollowVehicle]);

  // Helper to fit all points
  const handleFitBounds = () => {
    if (!mapInstanceRef.current || waypoints.length === 0) return;
    const bounds = L.latLngBounds(waypoints.map(w => [w.lat, w.lng]));
    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], animate: true });
  };

  const handleFocusVehicle = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView(currentVehicleCoords, 15, { animate: true });
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  return (
    <div className="relative w-full h-[600px] lg:h-[680px] bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
      {/* Top Left HUD Info */}
      <div className="absolute top-4 left-4 z-[400] flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 text-xs font-mono text-slate-200 shadow-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white">REAL GPS TILE ENGINE</span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-400 font-semibold">{waypoints.length} STOPS</span>
        </div>

        {/* Engine Switcher */}
        <div className="flex items-center bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-1 shadow-xl text-xs font-mono">
          <button
            onClick={() => handleEngineChange('google')}
            className="px-2.5 py-1 rounded-xl text-slate-400 hover:text-white transition-all font-bold"
          >
            Google Maps
          </button>
          <button
            onClick={() => handleEngineChange('leaflet')}
            className="px-2.5 py-1 rounded-xl font-bold bg-slate-800 text-cyan-300 shadow-md border border-slate-700 transition-all"
          >
            Leaflet / OSM
          </button>
        </div>

        {/* Traffic Density Indicator */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 text-xs shadow-xl">
          <span className="text-slate-400 font-medium">Flux Traffic:</span>
          <span className={`inline-flex items-center gap-1 font-semibold ${
            trafficLevel === 'heavy' ? 'text-rose-400' :
            trafficLevel === 'moderate' ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              trafficLevel === 'heavy' ? 'bg-rose-500 animate-pulse' :
              trafficLevel === 'moderate' ? 'bg-amber-500' : 'bg-emerald-500'
            }`} />
            {trafficLevel.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Top Right Map Layer Controls */}
      <div className="absolute top-4 right-4 z-[400] flex items-center gap-2">
        {/* Tile Layer Switcher */}
        <div className="flex items-center bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-1 shadow-xl text-xs font-medium">
          <button
            onClick={() => setActiveTileType('dark')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTileType === 'dark' 
                ? 'bg-slate-800 text-cyan-300 font-bold shadow-sm border border-slate-700' 
                : 'text-slate-400 hover:text-white'
            }`}
            title="CartoDB Dark Matter Logistics Tiles"
          >
            Dark Fleet
          </button>
          <button
            onClick={() => setActiveTileType('streets')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTileType === 'streets' 
                ? 'bg-slate-800 text-cyan-300 font-bold shadow-sm border border-slate-700' 
                : 'text-slate-400 hover:text-white'
            }`}
            title="OpenStreetMap Street View"
          >
            Streets
          </button>
          <button
            onClick={() => setActiveTileType('satellite')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTileType === 'satellite' 
                ? 'bg-slate-800 text-cyan-300 font-bold shadow-sm border border-slate-700' 
                : 'text-slate-400 hover:text-white'
            }`}
            title="Esri World Satellite Imagery"
          >
            Satellite
          </button>
        </div>

        {/* Quick Zoom & Reset Buttons */}
        <div className="flex items-center bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-1 shadow-xl">
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl text-base font-bold transition-colors"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl text-base font-bold transition-colors"
            title="Zoom Out"
          >
            -
          </button>
          <button
            onClick={handleFitBounds}
            className="p-2 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-xl transition-colors"
            title="Fit All Route Stops"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleFocusVehicle}
            className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-xl transition-colors"
            title="Locate Active Courier"
          >
            <LocateFixed className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* The Real Leaflet Map Container */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full z-10 focus:outline-none"
        style={{ minHeight: '100%' }}
      />

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
          <span>Optimized Polyline Circuit</span>
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
    </div>
  );
};
