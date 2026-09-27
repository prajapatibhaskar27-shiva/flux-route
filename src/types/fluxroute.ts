export interface Recipient {
  name: string;
  phone: string;
  company?: string;
  notes?: string;
}

export interface PackageDetails {
  trackingId: string;
  weightKg: number;
  volumeM3: number;
  priority: 'rush' | 'timed' | 'standard' | 'cold_chain';
  description: string;
  signatureRequired: boolean;
}

export interface Waypoint {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  type: 'depot' | 'delivery' | 'pickup' | 'hub';
  status: 'pending' | 'in_transit' | 'delivered' | 'exception';
  timeWindow: {
    start: string;
    end: string;
  };
  recipient: Recipient;
  packageDetails: PackageDetails;
  sequenceOrder: number;
  estimatedArrival: string;
  actualArrival?: string;
  distanceFromPreviousMiles?: number;
  driveTimeFromPreviousMins?: number;
}

export interface FleetVehicle {
  id: string;
  name: string;
  callSign: string;
  model: string;
  licensePlate: string;
  driverName: string;
  driverAvatar: string;
  driverPhone: string;
  type: 'ev_van' | 'cargo_sprinter' | 'e_bike' | 'heavy_truck';
  status: 'en_route' | 'idle' | 'charging' | 'loading';
  batteryOrFuelPct: number;
  currentLoadKg: number;
  maxCapacityKg: number;
  assignedRouteId: string;
  currentLocation: {
    lat: number;
    lng: number;
  };
  headingDeg: number;
  speedMph: number;
  completedStops: number;
  totalStops: number;
}

export interface FluxEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  type: 'traffic_surge' | 'rush_order_inserted' | 'road_closure' | 'battery_low' | 'customer_delayed';
  severity: 'info' | 'warning' | 'alert';
  resolved: boolean;
  impactMinutes: number;
  timeSavedByFluxMins?: number;
}

export interface RouteOptimizationResult {
  originalDistanceMiles: number;
  optimizedDistanceMiles: number;
  milesSaved: number;
  originalTimeMins: number;
  optimizedTimeMins: number;
  timeSavedMins: number;
  co2SavedKg: number;
  fuelSavedUsd: number;
  efficiencyGainPct: number;
}
