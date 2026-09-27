import { Waypoint, FleetVehicle, FluxEvent } from '../types/fluxroute';

// Base Depot Coordinates: Central Logistics Hub (SOMA / Mission Bay, SF)
export const DEPOT_LOCATION: Waypoint = {
  id: 'depot-01',
  name: 'FluxRoute Central Dispatch Depot #1',
  address: '650 Townsend St',
  city: 'San Francisco, CA',
  lat: 37.7715,
  lng: -122.4035,
  type: 'depot',
  status: 'delivered',
  timeWindow: {
    start: '06:00',
    end: '22:00'
  },
  recipient: {
    name: 'Depot Fleet Operations',
    phone: '+1 (415) 555-0100',
    company: 'FluxRoute Logistics Global',
    notes: 'Primary dispatch bay, automated sorting dock #4'
  },
  packageDetails: {
    trackingId: 'DEPOT-HUB-01',
    weightKg: 0,
    volumeM3: 0,
    priority: 'standard',
    description: 'Fleet origin and return charging terminal',
    signatureRequired: false
  },
  sequenceOrder: 0,
  estimatedArrival: '08:00'
};

export const INITIAL_WAYPOINTS: Waypoint[] = [
  DEPOT_LOCATION,
  {
    id: 'stop-01',
    name: 'Luminary Medical Clinic',
    address: '450 Sutter St, Ste 820',
    city: 'San Francisco, CA',
    lat: 37.7895,
    lng: -122.4072,
    type: 'delivery',
    status: 'in_transit',
    timeWindow: {
      start: '08:30',
      end: '10:00'
    },
    recipient: {
      name: 'Dr. Elena Vance',
      phone: '+1 (415) 555-0219',
      company: 'Luminary Health Group',
      notes: 'Deliver to 8th floor reception, cold insulated pack'
    },
    packageDetails: {
      trackingId: 'FLX-8921-US',
      weightKg: 4.8,
      volumeM3: 0.03,
      priority: 'cold_chain',
      description: 'Lab test samples & refrigerated vaccines',
      signatureRequired: true
    },
    sequenceOrder: 1,
    estimatedArrival: '08:42',
    distanceFromPreviousMiles: 2.1,
    driveTimeFromPreviousMins: 11
  },
  {
    id: 'stop-02',
    name: 'Apex Design Collective',
    address: '220 Montgomery St, 5th Floor',
    city: 'San Francisco, CA',
    lat: 37.7912,
    lng: -122.4024,
    type: 'delivery',
    status: 'pending',
    timeWindow: {
      start: '09:00',
      end: '11:00'
    },
    recipient: {
      name: 'Julian Sterling',
      phone: '+1 (415) 555-0344',
      company: 'Apex Design LLC',
      notes: 'Ring buzzer #502, leave with security if unavailable'
    },
    packageDetails: {
      trackingId: 'FLX-8922-US',
      weightKg: 8.5,
      volumeM3: 0.08,
      priority: 'rush',
      description: 'Architectural prototypes & 3D prints',
      signatureRequired: true
    },
    sequenceOrder: 2,
    estimatedArrival: '09:05',
    distanceFromPreviousMiles: 0.9,
    driveTimeFromPreviousMins: 7
  },
  {
    id: 'stop-03',
    name: 'Embarcadero Horizon Labs',
    address: '101 The Embarcadero, Suite 200',
    city: 'San Francisco, CA',
    lat: 37.7968,
    lng: -122.3948,
    type: 'delivery',
    status: 'pending',
    timeWindow: {
      start: '09:30',
      end: '11:30'
    },
    recipient: {
      name: 'Marcus Brody',
      phone: '+1 (415) 555-0481',
      company: 'Horizon BioTech',
      notes: 'Rear service elevator code 4912'
    },
    packageDetails: {
      trackingId: 'FLX-8923-US',
      weightKg: 12.0,
      volumeM3: 0.12,
      priority: 'standard',
      description: 'Spectrometry calibration sensors',
      signatureRequired: false
    },
    sequenceOrder: 3,
    estimatedArrival: '09:28',
    distanceFromPreviousMiles: 1.4,
    driveTimeFromPreviousMins: 9
  },
  {
    id: 'stop-04',
    name: 'Fisherman’s Wharf Supply Co',
    address: '680 Beach St',
    city: 'San Francisco, CA',
    lat: 37.8071,
    lng: -122.4208,
    type: 'delivery',
    status: 'pending',
    timeWindow: {
      start: '10:00',
      end: '12:00'
    },
    recipient: {
      name: 'Captain Sean O’Malley',
      phone: '+1 (415) 555-0552',
      company: 'Wharf Marine Services',
      notes: 'Dockside office next to Pier 45'
    },
    packageDetails: {
      trackingId: 'FLX-8924-US',
      weightKg: 28.4,
      volumeM3: 0.35,
      priority: 'timed',
      description: 'Marine navigation telemetry units',
      signatureRequired: true
    },
    sequenceOrder: 4,
    estimatedArrival: '09:58',
    distanceFromPreviousMiles: 2.3,
    driveTimeFromPreviousMins: 14
  },
  {
    id: 'stop-05',
    name: 'Marina Gourmet Roasters',
    address: '2150 Chestnut St',
    city: 'San Francisco, CA',
    lat: 37.8005,
    lng: -122.4412,
    type: 'delivery',
    status: 'pending',
    timeWindow: {
      start: '10:30',
      end: '12:30'
    },
    recipient: {
      name: 'Clara Chen',
      phone: '+1 (415) 555-0678',
      company: 'Marina Roasters',
      notes: 'Delivery door on Pierce St alley'
    },
    packageDetails: {
      trackingId: 'FLX-8925-US',
      weightKg: 18.0,
      volumeM3: 0.18,
      priority: 'standard',
      description: 'Specialty espresso hardware & filters',
      signatureRequired: false
    },
    sequenceOrder: 5,
    estimatedArrival: '10:25',
    distanceFromPreviousMiles: 1.8,
    driveTimeFromPreviousMins: 10
  },
  {
    id: 'stop-06',
    name: 'Presidio Heights Residence',
    address: '3420 Jackson St',
    city: 'San Francisco, CA',
    lat: 37.7901,
    lng: -122.4518,
    type: 'delivery',
    status: 'pending',
    timeWindow: {
      start: '11:00',
      end: '13:00'
    },
    recipient: {
      name: 'Victoria Thorne',
      phone: '+1 (415) 555-0723',
      notes: 'Gate code #8821, leave under covered portico'
    },
    packageDetails: {
      trackingId: 'FLX-8926-US',
      weightKg: 6.2,
      volumeM3: 0.05,
      priority: 'rush',
      description: 'Urgent legal contract documents & parcel',
      signatureRequired: true
    },
    sequenceOrder: 6,
    estimatedArrival: '10:52',
    distanceFromPreviousMiles: 1.6,
    driveTimeFromPreviousMins: 11
  },
  {
    id: 'stop-07',
    name: 'Inner Sunset Tech Hub',
    address: '1340 9th Ave',
    city: 'San Francisco, CA',
    lat: 37.7634,
    lng: -122.4662,
    type: 'delivery',
    status: 'pending',
    timeWindow: {
      start: '11:30',
      end: '13:30'
    },
    recipient: {
      name: 'Tariq Al-Mansoor',
      phone: '+1 (415) 555-0819',
      company: 'Sunset MicroSystems',
      notes: 'Loading bay B behind the main building'
    },
    packageDetails: {
      trackingId: 'FLX-8927-US',
      weightKg: 34.0,
      volumeM3: 0.42,
      priority: 'timed',
      description: 'Server blade replacements & optic cables',
      signatureRequired: true
    },
    sequenceOrder: 7,
    estimatedArrival: '11:24',
    distanceFromPreviousMiles: 2.7,
    driveTimeFromPreviousMins: 15
  },
  {
    id: 'stop-08',
    name: 'Mission Dolores Hardware Hub',
    address: '520 Valencia St',
    city: 'San Francisco, CA',
    lat: 37.7645,
    lng: -122.4219,
    type: 'delivery',
    status: 'pending',
    timeWindow: {
      start: '12:00',
      end: '14:30'
    },
    recipient: {
      name: 'Mateo Hernandez',
      phone: '+1 (415) 555-0940',
      company: 'Valencia Artisan Guild',
      notes: 'Side roll-up gate, forklift driver on site'
    },
    packageDetails: {
      trackingId: 'FLX-8928-US',
      weightKg: 45.0,
      volumeM3: 0.60,
      priority: 'standard',
      description: 'Precision CNC lathe components',
      signatureRequired: true
    },
    sequenceOrder: 8,
    estimatedArrival: '11:58',
    distanceFromPreviousMiles: 3.1,
    driveTimeFromPreviousMins: 17
  },
  {
    id: 'stop-09',
    name: 'Potrero Biotech Center',
    address: '1500 Owens St, Suite 410',
    city: 'San Francisco, CA',
    lat: 37.7682,
    lng: -122.3929,
    type: 'delivery',
    status: 'pending',
    timeWindow: {
      start: '13:00',
      end: '15:00'
    },
    recipient: {
      name: 'Dr. Sarah Lin',
      phone: '+1 (415) 555-1032',
      company: 'Potrero Therapeutics',
      notes: 'Security check-in at North lobby desk'
    },
    packageDetails: {
      trackingId: 'FLX-8929-US',
      weightKg: 5.5,
      volumeM3: 0.04,
      priority: 'rush',
      description: 'Clinical trial patient test documentation',
      signatureRequired: true
    },
    sequenceOrder: 9,
    estimatedArrival: '12:28',
    distanceFromPreviousMiles: 1.9,
    driveTimeFromPreviousMins: 11
  }
];

export const FLEET_VEHICLES: FleetVehicle[] = [
  {
    id: 'veh-01',
    name: 'VoltVan Alpha',
    callSign: 'FLX-VAN-01',
    model: 'Rivian Commercial EV Van 700',
    licensePlate: '8FLX401',
    driverName: 'Marcus Rivera',
    driverAvatar: '',
    driverPhone: '+1 (415) 555-4401',
    type: 'ev_van',
    status: 'en_route',
    batteryOrFuelPct: 88,
    currentLoadKg: 162.4,
    maxCapacityKg: 850,
    assignedRouteId: 'route-sf-metro-01',
    currentLocation: {
      lat: 37.7795,
      lng: -122.4055
    },
    headingDeg: 340,
    speedMph: 26,
    completedStops: 1,
    totalStops: 9
  },
  {
    id: 'veh-02',
    name: 'SprintHaul Beta',
    callSign: 'FLX-VAN-02',
    model: 'Mercedes Sprinter Cargo 2500',
    licensePlate: '7FLX912',
    driverName: 'Devon Vance',
    driverAvatar: '',
    driverPhone: '+1 (415) 555-4402',
    type: 'cargo_sprinter',
    status: 'en_route',
    batteryOrFuelPct: 74,
    currentLoadKg: 420.0,
    maxCapacityKg: 1200,
    assignedRouteId: 'route-sf-metro-02',
    currentLocation: {
      lat: 37.7550,
      lng: -122.4150
    },
    headingDeg: 120,
    speedMph: 22,
    completedStops: 5,
    totalStops: 12
  },
  {
    id: 'veh-03',
    name: 'EcoCourier Gamma',
    callSign: 'FLX-BIKE-03',
    model: 'Urban Arrow Heavy Cargo e-Bike',
    licensePlate: 'EBIKE-38',
    driverName: 'Maya Thorne',
    driverAvatar: '',
    driverPhone: '+1 (415) 555-4403',
    type: 'e_bike',
    status: 'en_route',
    batteryOrFuelPct: 94,
    currentLoadKg: 65.0,
    maxCapacityKg: 150,
    assignedRouteId: 'route-sf-downtown-express',
    currentLocation: {
      lat: 37.7920,
      lng: -122.4010
    },
    headingDeg: 45,
    speedMph: 14,
    completedStops: 8,
    totalStops: 14
  },
  {
    id: 'veh-04',
    name: 'Titan Freight Delta',
    callSign: 'FLX-TRK-04',
    model: 'Freightliner eM2 Electric Truck',
    licensePlate: '9FLX880',
    driverName: 'Kareem Johnson',
    driverAvatar: '',
    driverPhone: '+1 (415) 555-4404',
    type: 'heavy_truck',
    status: 'loading',
    batteryOrFuelPct: 100,
    currentLoadKg: 2400.0,
    maxCapacityKg: 7500,
    assignedRouteId: 'route-bay-intermodal',
    currentLocation: {
      lat: 37.7715,
      lng: -122.4035
    },
    headingDeg: 0,
    speedMph: 0,
    completedStops: 0,
    totalStops: 4
  }
];

export const INITIAL_FLUX_EVENTS: FluxEvent[] = [
  {
    id: 'ev-01',
    timestamp: '08:44:12',
    title: 'Surge Congestion on 101 Northbound',
    description: 'Sudden bottleneck detected near Central Freeway exit. FluxRoute re-calculated alternative urban arterials, avoiding +18m gridlock.',
    type: 'traffic_surge',
    severity: 'warning',
    resolved: true,
    impactMinutes: 18,
    timeSavedByFluxMins: 14
  },
  {
    id: 'ev-02',
    timestamp: '09:12:05',
    title: 'Priority Cold-Chain Insertion',
    description: 'Dr. Elena Vance requested urgent specimen drop at Luminary Clinic. Route automatically re-sequenced as Top Stop #1.',
    type: 'rush_order_inserted',
    severity: 'info',
    resolved: true,
    impactMinutes: 0,
    timeSavedByFluxMins: 22
  },
  {
    id: 'ev-03',
    timestamp: '10:04:30',
    title: 'Cable Car Track Maintenance on Powell St',
    description: 'Utility line closure between Sutter and Post. Flux algorithmic detour selected Mason St corridor.',
    type: 'road_closure',
    severity: 'warning',
    resolved: true,
    impactMinutes: 9,
    timeSavedByFluxMins: 8
  }
];
