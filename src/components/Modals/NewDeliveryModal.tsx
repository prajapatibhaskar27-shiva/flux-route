import React, { useState } from 'react';
import { Waypoint } from '../../types/fluxroute';
import { 
  X, 
  Plus, 
  MapPin, 
  Clock, 
  Package, 
  User, 
  Sparkles, 
  Flame, 
  Thermometer 
} from 'lucide-react';

interface NewDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWaypoint: (newWaypoint: Waypoint, autoInsertOptimal: boolean) => void;
}

const PRESET_DESTINATIONS = [
  { name: 'Telegraph Hill Studio', address: '480 Green St', lat: 37.7995, lng: -122.4062, defaultPriority: 'standard' },
  { name: 'Mission Bay Bio-Incubator', address: '1700 4th St', lat: 37.7702, lng: -122.3912, defaultPriority: 'cold_chain' },
  { name: 'Hayes Valley Boutique', address: '420 Hayes St', lat: 37.7766, lng: -122.4241, defaultPriority: 'rush' },
  { name: 'Financial District Tower', address: '555 California St', lat: 37.7928, lng: -122.4041, defaultPriority: 'timed' },
];

export const NewDeliveryModal: React.FC<NewDeliveryModalProps> = ({
  isOpen,
  onClose,
  onAddWaypoint
}) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState<number>(37.7850);
  const [lng, setLng] = useState<number>(-122.4100);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('+1 (415) 555-0199');
  const [weightKg, setWeightKg] = useState<number>(6.5);
  const [priority, setPriority] = useState<Waypoint['packageDetails']['priority']>('standard');
  const [windowStart, setWindowStart] = useState('11:00');
  const [windowEnd, setWindowEnd] = useState('13:00');
  const [autoInsertOptimal, setAutoInsertOptimal] = useState(true);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof PRESET_DESTINATIONS[0]) => {
    setName(preset.name);
    setAddress(preset.address);
    setLat(preset.lat);
    setLng(preset.lng);
    setPriority(preset.defaultPriority as any);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address) return;

    const newStop: Waypoint = {
      id: `stop-${Date.now()}`,
      name,
      address,
      city: 'San Francisco, CA',
      lat,
      lng,
      type: 'delivery',
      status: 'pending',
      timeWindow: {
        start: windowStart,
        end: windowEnd
      },
      recipient: {
        name: recipientName || 'Deliver to Front Desk',
        phone: recipientPhone,
      },
      packageDetails: {
        trackingId: `FLX-${Math.floor(1000 + Math.random() * 9000)}-US`,
        weightKg,
        volumeM3: parseFloat((weightKg * 0.012).toFixed(2)),
        priority,
        description: 'Dispatched on-demand order',
        signatureRequired: priority === 'rush' || priority === 'cold_chain'
      },
      sequenceOrder: 99,
      estimatedArrival: '11:45'
    };

    onAddWaypoint(newStop, autoInsertOptimal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Add Delivery Destination</h2>
              <p className="text-xs text-slate-400">Queue a new stop into FluxRoute optimization matrix</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preset quick picks */}
        <div className="p-4 bg-slate-950/50 border-b border-slate-800/80">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2 font-medium">
            Quick Add Active Metro Hotspots:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_DESTINATIONS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
              >
                + {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Destination / Entity Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Hayes Valley Art Studio"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Street Address (San Francisco) *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 500 Fell St"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Recipient Name
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Liam Zhang"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Delivery Window
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={windowStart}
                  onChange={(e) => setWindowStart(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono text-center"
                />
                <span className="text-slate-500 font-mono">to</span>
                <input
                  type="time"
                  value={windowEnd}
                  onChange={(e) => setWindowEnd(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono text-center"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="80"
                value={weightKg}
                onChange={(e) => setWeightKg(parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Package Classification & Priority
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'standard', label: 'Standard' },
                { id: 'timed', label: 'Windowed' },
                { id: 'rush', label: 'Rush Express' },
                { id: 'cold_chain', label: 'Cold-Chain' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPriority(opt.id as any)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                    priority === opt.id
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Auto Insert Optimal Checkbox */}
          <div className="p-3 bg-slate-950 rounded-xl border border-cyan-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="font-semibold text-white block">Flux Dynamic Insertion</span>
                <span className="text-[11px] text-slate-400">
                  Automatically calculates minimal detour waypoint position
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoInsertOptimal}
              onChange={(e) => setAutoInsertOptimal(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
            >
              Add to Active Route
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
