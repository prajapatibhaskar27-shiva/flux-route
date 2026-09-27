import React, { useState, useEffect, useRef } from 'react';
import { Header, ActiveTab } from './components/Header';
import { FluxInteractiveMap } from './components/Map/FluxInteractiveMap';
import { SimulationControls } from './components/Map/SimulationControls';
import { RouteWaypointSidebar } from './components/Sidebar/RouteWaypointSidebar';
import { FleetBoard } from './components/Fleet/FleetBoard';
import { DeliveriesManifest } from './components/Manifest/DeliveriesManifest';
import { FluxAnalytics } from './components/Analytics/FluxAnalytics';
import { FluxAIRouterView } from './components/AIRouter/FluxAIRouterView';
import { CustomerTrackingModal } from './components/Customer/CustomerTrackingModal';
import { NewDeliveryModal } from './components/Modals/NewDeliveryModal';
import { CargoWalletView } from './components/Wallet/CargoWalletView';
import { PaymentResultModal } from './components/Wallet/PaymentResultModal';
import { PaymentReceiptModal } from './components/Wallet/PaymentReceiptModal';

import { 
  Waypoint, 
  FleetVehicle, 
  FluxEvent, 
  RouteOptimizationResult 
} from './types/fluxroute';
import { 
  CargoWalletState, 
  WalletTransaction 
} from './types/wallet';
import { 
  INITIAL_WAYPOINTS, 
  FLEET_VEHICLES, 
  INITIAL_FLUX_EVENTS 
} from './data/mockData';
import { 
  INITIAL_WALLET_STATE, 
  INITIAL_TRANSACTIONS 
} from './data/mockWalletData';
import { 
  runFluxOptimization, 
  insertOptimalWaypoint, 
  calculateTotalRouteDistance 
} from './utils/routeOptimizer';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dispatch_map');
  const [waypoints, setWaypoints] = useState<Waypoint[]>(INITIAL_WAYPOINTS);
  const [vehicles, setVehicles] = useState<FleetVehicle[]>(FLEET_VEHICLES);
  const [activeVehicleId, setActiveVehicleId] = useState<string>('veh-01');
  const [fluxEvents, setFluxEvents] = useState<FluxEvent[]>(INITIAL_FLUX_EVENTS);
  const [recentEvent, setRecentEvent] = useState<FluxEvent | null>(INITIAL_FLUX_EVENTS[0]);
  
  // Cargo Wallet State
  const [walletState, setWalletState] = useState<CargoWalletState>(INITIAL_WALLET_STATE);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>(INITIAL_TRANSACTIONS);
  const [isWalletProcessing, setIsWalletProcessing] = useState<boolean>(false);
  const [lastPaymentResult, setLastPaymentResult] = useState<WalletTransaction | null>(null);
  const [receiptModalTx, setReceiptModalTx] = useState<WalletTransaction | null>(null);

  // Selection and Modals
  const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(null);
  const [customerModalWaypoint, setCustomerModalWaypoint] = useState<Waypoint | null>(null);
  const [isNewDeliveryModalOpen, setIsNewDeliveryModalOpen] = useState(false);
  
  // Optimization & Traffic
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<RouteOptimizationResult | null>(null);
  const [trafficLevel, setTrafficLevel] = useState<'low' | 'moderate' | 'heavy'>('moderate');
  const [totalMilesSaved, setTotalMilesSaved] = useState<number>(34.8);
  const [totalCo2SavedKg, setTotalCo2SavedKg] = useState<number>(14.1);

  // Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSpeed, setSimSpeed] = useState<number>(2);
  const [simulatedStopIndex, setSimulatedStopIndex] = useState<number>(1);
  const [simulatedVehiclePos, setSimulatedVehiclePos] = useState<{ lat: number; lng: number } | null>(null);

  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId) || vehicles[0];
  const totalDistanceMiles = calculateTotalRouteDistance(waypoints);

  // Run Flux Optimization
  const handleOptimizeRoute = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      const trafficMultiplier = trafficLevel === 'heavy' ? 1.4 : trafficLevel === 'moderate' ? 1.15 : 1.0;
      const { optimizedWaypoints, result } = runFluxOptimization(waypoints, trafficMultiplier);
      
      setWaypoints(optimizedWaypoints);
      setOptimizationResult(result);
      setTotalMilesSaved((prev) => parseFloat((prev + result.milesSaved).toFixed(1)));
      setTotalCo2SavedKg((prev) => parseFloat((prev + result.co2SavedKg).toFixed(1)));
      setIsOptimizing(false);

      // Create a flux event notice
      const optEvent: FluxEvent = {
        id: `ev-opt-${Date.now()}`,
        timestamp: new Date().toTimeString().slice(0, 8),
        title: 'Flux TSP Re-Sequencing Completed',
        description: `Full circuit reordered: saved ${result.milesSaved} mi and ${result.timeSavedMins}m with ${result.efficiencyGainPct}% efficiency increase.`,
        type: 'rush_order_inserted',
        severity: 'info',
        resolved: true,
        impactMinutes: result.timeSavedMins,
        timeSavedByFluxMins: result.timeSavedMins
      };

      setFluxEvents((prev) => [optEvent, ...prev]);
      setRecentEvent(optEvent);
    }, 450);
  };

  // Move waypoint up in sequence
  const handleMoveUp = (index: number) => {
    if (index <= 1) return; // Keep depot at 0
    const updated = [...waypoints];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;

    // Resequence numbers
    const finalized = updated.map((wp, idx) => ({ ...wp, sequenceOrder: idx }));
    setWaypoints(finalized);
  };

  // Move waypoint down in sequence
  const handleMoveDown = (index: number) => {
    if (index >= waypoints.length - 1 || index === 0) return;
    const updated = [...waypoints];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;

    // Resequence numbers
    const finalized = updated.map((wp, idx) => ({ ...wp, sequenceOrder: idx }));
    setWaypoints(finalized);
  };

  // Remove waypoint
  const handleRemoveWaypoint = (id: string) => {
    const updated = waypoints.filter((wp) => wp.id !== id);
    const finalized = updated.map((wp, idx) => ({ ...wp, sequenceOrder: idx }));
    setWaypoints(finalized);
    if (selectedWaypoint?.id === id) {
      setSelectedWaypoint(null);
    }
  };

  // Add new delivery stop
  const handleAddWaypoint = (newWaypoint: Waypoint, autoInsertOptimal: boolean) => {
    let updated: Waypoint[];
    if (autoInsertOptimal) {
      updated = insertOptimalWaypoint(waypoints, newWaypoint);
    } else {
      updated = [...waypoints, { ...newWaypoint, sequenceOrder: waypoints.length }];
    }

    setWaypoints(updated);
    setSelectedWaypoint(newWaypoint);

    const addEvent: FluxEvent = {
      id: `ev-add-${Date.now()}`,
      timestamp: new Date().toTimeString().slice(0, 8),
      title: 'Dynamic On-Demand Waypoint Enqueued',
      description: `Added "${newWaypoint.name}" (${newWaypoint.packageDetails.priority}). Integrated into corridor with minimum detour.`,
      type: 'rush_order_inserted',
      severity: 'info',
      resolved: true,
      impactMinutes: 6,
      timeSavedByFluxMins: 11
    };

    setFluxEvents((prev) => [addEvent, ...prev]);
    setRecentEvent(addEvent);
  };

  // Inject dynamic real-time flux events
  const handleInjectFluxEvent = (eventType: FluxEvent['type']) => {
    let title = '';
    let desc = '';
    let saved = 12;

    if (eventType === 'traffic_surge') {
      setTrafficLevel('heavy');
      title = 'Traffic Surge Alarm: Highway 101 Corridor';
      desc = 'Sensor grid flagged sudden slowdown (+18m delay). Flux dynamic reroute bypassed congestion via 3rd St.';
      saved = 14;
    } else if (eventType === 'rush_order_inserted') {
      title = 'Emergency Cold-Chain Delivery Injected';
      desc = 'Hospital urgent blood specimen added to dispatch queue. Inserted into position #2 with 0m detour.';
      saved = 20;
    } else if (eventType === 'road_closure') {
      title = 'Utility Construction Closure on Mason St';
      desc = 'Road sector closed for 2 hours. FluxRoute autonomously shifted vehicle to parallel avenue.';
      saved = 9;
    } else if (eventType === 'battery_low') {
      title = 'VoltVan EV Range Optimization';
      desc = 'Battery state flagged under 20%. Rerouted path near Mission Bay Supercharger.';
      saved = 15;
    } else {
      title = 'Schedule Flux Recalculated';
      desc = 'Customer requested 30-minute later drop-off window.';
      saved = 7;
    }

    const newEv: FluxEvent = {
      id: `ev-${Date.now()}`,
      timestamp: new Date().toTimeString().slice(0, 8),
      title,
      description: desc,
      type: eventType,
      severity: eventType === 'road_closure' ? 'alert' : 'warning',
      resolved: true,
      impactMinutes: 15,
      timeSavedByFluxMins: saved
    };

    setFluxEvents((prev) => [newEv, ...prev]);
    setRecentEvent(newEv);
  };

  // Reset simulation to depot
  const handleResetSimulation = () => {
    setIsSimulating(false);
    setSimulatedStopIndex(1);
    if (waypoints.length > 0) {
      setSimulatedVehiclePos({ lat: waypoints[0].lat, lng: waypoints[0].lng });
    }
  };

  // Simulation tick loop
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setSimulatedStopIndex((prevIndex) => {
        if (prevIndex >= waypoints.length) {
          // Reached depot end
          setIsSimulating(false);
          return 0;
        }

        const nextWp = waypoints[prevIndex];
        setSimulatedVehiclePos({ lat: nextWp.lat, lng: nextWp.lng });

        // Update stop status to delivered
        setWaypoints((curr) =>
          curr.map((w, idx) => (idx === prevIndex ? { ...w, status: 'delivered' } : w))
        );

        return prevIndex + 1;
      });
    }, 2800 / simSpeed);

    return () => clearInterval(interval);
  }, [isSimulating, simSpeed, waypoints]);

  // Update status from manifest
  const handleUpdateStatus = (id: string, newStatus: Waypoint['status']) => {
    setWaypoints((curr) =>
      curr.map((wp) => (wp.id === id ? { ...wp, status: newStatus } : wp))
    );
  };

  // Process Add Money to Cargo Wallet
  const handleProcessAddMoney = (
    amount: number,
    method: string,
    simulationMode: 'success' | 'failed' | 'pending'
  ) => {
    setIsWalletProcessing(true);
    setTimeout(() => {
      const now = new Date();
      const dateFormatted = now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) + ', ' + now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      const randomDigits = Math.floor(100000 + Math.random() * 900000);
      const isSuccess = simulationMode === 'success';
      const isPending = simulationMode === 'pending';

      const newTx: WalletTransaction = {
        id: `TXN-CRG-${randomDigits}`,
        date: dateFormatted,
        timestamp: Date.now(),
        amount,
        type: 'credit',
        category: 'wallet_topup',
        paymentMethod: method,
        status: isSuccess ? 'successful' : isPending ? 'pending' : 'failed',
        referenceId: method.includes('UPI')
          ? `UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}`
          : `PG/BANK/${randomDigits}`,
        description: `Instant Cargo Wallet Top-up via ${method}`,
        failureReason: simulationMode === 'failed' ? 'Bank 3D-Secure authentication timed out. No funds were debited.' : undefined,
        taxInvoiceNo: `INV-${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: 'Shiva Logistics & Freight Enterprises',
        customerGstin: '27AABCS1429E1Z2'
      };

      if (isSuccess) {
        setWalletState((prev) => ({
          ...prev,
          availableBalance: prev.availableBalance + amount
        }));
      }

      setWalletTransactions((prev) => [newTx, ...prev]);
      setIsWalletProcessing(false);
      setLastPaymentResult(newTx);
    }, 750);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* 3-Zone Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOptimizeClick={handleOptimizeRoute}
        onNewDeliveryClick={() => setIsNewDeliveryModalOpen(true)}
        onCustomerViewClick={() => {
          const sample = waypoints.find((w) => w.type !== 'depot') || waypoints[1];
          setCustomerModalWaypoint(sample);
        }}
        isOptimizing={isOptimizing}
        isSimulating={isSimulating}
        onToggleSimulation={() => setIsSimulating(!isSimulating)}
        optimizedCount={waypoints.length}
        walletBalance={walletState.availableBalance}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full">
        {activeTab === 'cargo_wallet' && (
          <CargoWalletView
            walletState={walletState}
            transactions={walletTransactions}
            onAddMoney={handleProcessAddMoney}
            isProcessing={isWalletProcessing}
            onGoToBookings={() => setActiveTab('dispatch_map')}
          />
        )}

        {activeTab === 'dispatch_map' && (
          <div className="space-y-4">
            {/* Simulation & Telemetry Bar */}
            <SimulationControls
              isSimulating={isSimulating}
              onToggleSimulation={() => setIsSimulating(!isSimulating)}
              onResetSimulation={handleResetSimulation}
              simSpeed={simSpeed}
              onChangeSpeed={(spd) => setSimSpeed(spd)}
              currentStopIndex={simulatedStopIndex}
              totalStops={waypoints.length - 1}
              activeVehicle={activeVehicle}
              onInjectFluxEvent={handleInjectFluxEvent}
              recentEvent={recentEvent}
            />

            {/* Map & Stops Layout */}
            <div className="flex flex-col lg:flex-row gap-4 items-start">
              {/* Interactive Vector Map Canvas */}
              <div className="flex-1 w-full">
                <FluxInteractiveMap
                  waypoints={waypoints}
                  activeVehicle={activeVehicle}
                  simulationProgressPct={
                    waypoints.length > 1 ? (simulatedStopIndex / (waypoints.length - 1)) * 100 : 0
                  }
                  simulatedVehiclePos={simulatedVehiclePos}
                  onSelectWaypoint={(wp) => setSelectedWaypoint(wp)}
                  selectedWaypoint={selectedWaypoint}
                  trafficLevel={trafficLevel}
                  isSimulating={isSimulating}
                  simSpeed={simSpeed}
                  currentStopIndex={simulatedStopIndex}
                />
              </div>

              {/* Waypoint Ordered Sequence Sidebar */}
              <RouteWaypointSidebar
                waypoints={waypoints}
                selectedWaypoint={selectedWaypoint}
                onSelectWaypoint={(wp) => setSelectedWaypoint(wp)}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onRemoveWaypoint={handleRemoveWaypoint}
                onOptimize={handleOptimizeRoute}
                isOptimizing={isOptimizing}
                optimizationResult={optimizationResult}
                totalDistanceMiles={totalDistanceMiles}
              />
            </div>
          </div>
        )}

        {activeTab === 'fleet_board' && (
          <FleetBoard
            vehicles={vehicles}
            onSelectVehicle={(veh) => {
              setActiveVehicleId(veh.id);
              setActiveTab('dispatch_map');
            }}
            activeVehicleId={activeVehicleId}
          />
        )}

        {activeTab === 'manifest' && (
          <DeliveriesManifest
            waypoints={waypoints}
            onUpdateStatus={handleUpdateStatus}
            onOpenCustomerView={(wp) => setCustomerModalWaypoint(wp)}
          />
        )}

        {activeTab === 'analytics' && (
          <FluxAnalytics
            events={fluxEvents}
            totalMilesSaved={totalMilesSaved}
            totalCo2SavedKg={totalCo2SavedKg}
          />
        )}

        {activeTab === 'ai_router' && (
          <FluxAIRouterView />
        )}
      </main>

      {/* Customer Tracking Modal */}
      {customerModalWaypoint && (
        <CustomerTrackingModal
          waypoint={customerModalWaypoint}
          activeVehicle={activeVehicle}
          onClose={() => setCustomerModalWaypoint(null)}
        />
      )}

      {/* Add New Delivery Modal */}
      <NewDeliveryModal
        isOpen={isNewDeliveryModalOpen}
        onClose={() => setIsNewDeliveryModalOpen(false)}
        onAddWaypoint={handleAddWaypoint}
      />

      {/* Payment Confirmation / Result Modal */}
      {lastPaymentResult && (
        <PaymentResultModal
          transaction={lastPaymentResult}
          newWalletBalance={walletState.availableBalance}
          onClose={() => setLastPaymentResult(null)}
          onRetry={() => {
            setLastPaymentResult(null);
            setActiveTab('cargo_wallet');
          }}
          onViewReceipt={(tx) => {
            setLastPaymentResult(null);
            setReceiptModalTx(tx);
          }}
          onGoToBookings={() => {
            setLastPaymentResult(null);
            setActiveTab('dispatch_map');
          }}
        />
      )}

      {/* Payment Receipt / Tax Invoice Modal */}
      {receiptModalTx && (
        <PaymentReceiptModal
          transaction={receiptModalTx}
          onClose={() => setReceiptModalTx(null)}
        />
      )}
    </div>
  );
}
