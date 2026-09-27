import React from 'react';
import { 
  Navigation, 
  Truck, 
  Package, 
  BarChart3, 
  Cpu, 
  Sparkles, 
  Play, 
  Plus, 
  Eye, 
  Zap, 
  CheckCircle2,
  Wallet
} from 'lucide-react';

export type ActiveTab = 'dispatch_map' | 'fleet_board' | 'manifest' | 'analytics' | 'ai_router' | 'cargo_wallet';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOptimizeClick: () => void;
  onNewDeliveryClick: () => void;
  onCustomerViewClick: () => void;
  isOptimizing: boolean;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  optimizedCount: number;
  walletBalance?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOptimizeClick,
  onNewDeliveryClick,
  onCustomerViewClick,
  isOptimizing,
  isSimulating,
  onToggleSimulation,
  optimizedCount,
  walletBalance = 24850
}) => {
  const formattedBalance = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(walletBalance);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      {/* Zone 1: Single element Brand Wordmark with subtle live status */}
      <div className="flex items-center gap-3">
        <a 
          href="#dashboard" 
          onClick={(e) => { e.preventDefault(); onTabChange('dispatch_map'); }}
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white hover:text-cyan-400 transition-colors"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 text-white shadow-lg shadow-cyan-500/20">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            FluxRoute
          </span>
        </a>
        <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-slate-800 text-xs font-mono text-slate-400">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>CARGO DISPATCH NETWORK</span>
        </div>
      </div>

      {/* Zone 2: Navigation Links (single-line, clean hover states) */}
      <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-950/60 rounded-xl border border-slate-800/80">
        <button
          onClick={() => onTabChange('dispatch_map')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'dispatch_map'
              ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Dispatch Map</span>
        </button>

        <button
          onClick={() => onTabChange('cargo_wallet')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'cargo_wallet'
              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 shadow-sm'
              : 'text-emerald-400/90 hover:text-emerald-300 hover:bg-slate-800/40'
          }`}
        >
          <Wallet className="w-3.5 h-3.5 text-emerald-400" />
          <span>Cargo Wallet</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </button>

        <button
          onClick={() => onTabChange('fleet_board')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'fleet_board'
              ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Fleet</span>
        </button>

        <button
          onClick={() => onTabChange('manifest')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'manifest'
              ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Manifest</span>
        </button>

        <button
          onClick={() => onTabChange('analytics')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Analytics</span>
        </button>

        <button
          onClick={() => onTabChange('ai_router')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'ai_router'
              ? 'bg-gradient-to-r from-cyan-950 to-blue-950 text-cyan-300 border border-cyan-700/50 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>AI Gateway</span>
        </button>
      </nav>

      {/* Zone 3: Wallet Balance Chip & Primary Action buttons */}
      <div className="flex items-center gap-2">
        {/* Wallet Balance Chip */}
        <button
          onClick={() => onTabChange('cargo_wallet')}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 hover:bg-slate-900 border border-emerald-900/60 hover:border-emerald-700 rounded-xl transition-all shadow-sm group"
          title="Open Cargo Wallet & Add Money"
        >
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Wallet className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <span className="text-[10px] text-slate-400 font-sans block leading-none">Wallet</span>
            <span className="text-xs font-bold font-mono text-emerald-400 group-hover:text-emerald-300 tabular-nums">
              {formattedBalance}
            </span>
          </div>
          <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/40 ml-0.5">
            + Add
          </span>
        </button>

        <button
          onClick={onCustomerViewClick}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 rounded-xl transition-colors whitespace-nowrap"
          title="Preview end-customer live tracking screen"
        >
          <Eye className="w-3.5 h-3.5 text-slate-400" />
          <span>Track</span>
        </button>

        <button
          onClick={onNewDeliveryClick}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5 text-cyan-400" />
          <span>+ Delivery</span>
        </button>

        <button
          onClick={onOptimizeClick}
          disabled={isOptimizing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 active:scale-98 rounded-xl shadow-md shadow-cyan-500/20 transition-all whitespace-nowrap disabled:opacity-50"
        >
          {isOptimizing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              <span>Optimizing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Optimize</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
