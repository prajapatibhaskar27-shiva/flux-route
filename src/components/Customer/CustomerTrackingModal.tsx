import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Waypoint, FleetVehicle } from '../../types/fluxroute';
import { 
  X, 
  MapPin, 
  Clock, 
  Truck, 
  Phone, 
  ShieldCheck, 
  CheckCircle, 
  ArrowRight, 
  Share2, 
  Send 
} from 'lucide-react';

interface CustomerTrackingModalProps {
  waypoint: Waypoint;
  activeVehicle: FleetVehicle;
  onClose: () => void;
}

export const CustomerTrackingModal: React.FC<CustomerTrackingModalProps> = ({
  waypoint,
  activeVehicle,
  onClose
}) => {
  const miniMapRef = useRef<HTMLDivElement>(null);
  const miniMapInstanceRef = useRef<L.Map | null>(null);

  const [customerNote, setCustomerNote] = useState(waypoint.recipient.notes || '');
  const [noteSaved, setNoteSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!miniMapRef.current || miniMapInstanceRef.current) return;

    const map = L.map(miniMapRef.current, {
      center: [waypoint.lat, waypoint.lng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    // Destination Pin
    const destIcon = L.divIcon({
      className: 'custom-dest-pin',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-7 h-7 rounded-full bg-cyan-500 text-slate-950 font-bold flex items-center justify-center border-2 border-white shadow-lg text-xs">
            📍
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 28]
    });
    L.marker([waypoint.lat, waypoint.lng], { icon: destIcon }).addTo(map);

    // Courier Pin
    const courierIcon = L.divIcon({
      className: 'custom-courier-pin',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center border-2 border-white shadow-lg text-xs animate-pulse">
            🚚
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
    L.marker([activeVehicle.currentLocation.lat, activeVehicle.currentLocation.lng], { icon: courierIcon }).addTo(map);

    // Connecting line
    L.polyline([
      [activeVehicle.currentLocation.lat, activeVehicle.currentLocation.lng],
      [waypoint.lat, waypoint.lng]
    ], {
      color: '#38bdf8',
      weight: 3,
      dashArray: '6, 6',
      opacity: 0.8
    }).addTo(map);

    const bounds = L.latLngBounds([
      [activeVehicle.currentLocation.lat, activeVehicle.currentLocation.lng],
      [waypoint.lat, waypoint.lng]
    ]);
    map.fitBounds(bounds, { padding: [30, 30] });

    miniMapInstanceRef.current = map;

    return () => {
      map.remove();
      miniMapInstanceRef.current = null;
    };
  }, [waypoint, activeVehicle]);

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 3000);
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-cyan-300">
                LIVE FLUX TRACKING
              </span>
            </div>
            <h2 className="text-base font-bold text-white mt-0.5">
              Package #{waypoint.packageDetails.trackingId}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareLink}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              title="Share Tracking Link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Main Status Hero */}
          <div className="p-4 bg-gradient-to-br from-cyan-950/60 to-blue-950/40 border border-cyan-800/60 rounded-2xl text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 mb-2 shadow-lg shadow-cyan-500/10">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Out For Delivery</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Your courier is currently <strong className="text-cyan-300 font-mono">2 stops away</strong>
            </p>

            <div className="mt-3 p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 inline-block">
              <span className="text-[10px] text-slate-400 block font-medium">Estimated Arrival Time</span>
              <span className="text-xl font-bold font-mono text-cyan-300">
                {waypoint.estimatedArrival}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                Window: {waypoint.timeWindow.start} - {waypoint.timeWindow.end}
              </span>
            </div>
          </div>

          {/* Real Mini Map */}
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
              Live Courier Approach GPS
            </span>
            <div 
              ref={miniMapRef} 
              className="w-full h-44 rounded-2xl border border-slate-800 overflow-hidden shadow-inner"
            />
          </div>

          {/* Stepper Progress */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Shipment Milestones
            </span>
            <div className="space-y-2.5">
              {[
                { label: 'Manifest Created & Verified', time: '06:30 AM', done: true },
                { label: 'Loaded on Fleet EV Van #401', time: '08:00 AM', done: true },
                { label: 'Out for Delivery (Urban Corridor)', time: '08:15 AM', done: true, current: true },
                { label: 'Delivered to Recipient Door', time: waypoint.estimatedArrival, done: false }
              ].map((step, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-mono text-[10px] font-bold ${
                    step.current
                      ? 'bg-cyan-500 text-slate-950 ring-4 ring-cyan-500/20'
                      : step.done
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}>
                    {step.done ? '✓' : idx + 1}
                  </div>
                  <span className={`flex-1 font-medium ${step.current ? 'text-cyan-300 font-bold' : step.done ? 'text-slate-200' : 'text-slate-500'}`}>
                    {step.label}
                  </span>
                  <span className="text-slate-500 font-mono text-[11px]">{step.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Courier Card */}
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-xs font-bold text-cyan-300">
                {activeVehicle.driverName.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-white text-xs">{activeVehicle.driverName}</h4>
                <p className="text-[11px] text-slate-400">{activeVehicle.name} · {activeVehicle.licensePlate}</p>
              </div>
            </div>

            <a
              href={`tel:${activeVehicle.driverPhone}`}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl transition-colors border border-slate-700"
              title="Call Courier"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Recipient Delivery Notes Input */}
          <form onSubmit={handleSaveNote} className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Driver Delivery Instructions
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="e.g. Leave behind front pillar, ring bell #4..."
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-colors whitespace-nowrap"
              >
                Save
              </button>
            </div>
            {noteSaved && (
              <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle className="w-3 h-3" />
                <span>Instructions updated and dispatched to driver manifest!</span>
              </p>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Powered by FluxRoute Logistics Core</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

