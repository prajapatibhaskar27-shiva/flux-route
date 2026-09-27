import React, { useState } from 'react';
import { 
  CargoWalletState, 
  WalletTransaction 
} from '../../types/wallet';
import { AddMoneyCard } from './AddMoneyCard';
import { PaymentResultModal } from './PaymentResultModal';
import { PaymentReceiptModal } from './PaymentReceiptModal';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  RotateCcw, 
  FileText, 
  Search, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  HelpCircle, 
  Building2, 
  Fuel, 
  Truck, 
  RefreshCw,
  Sliders,
  DollarSign,
  AlertCircle
} from 'lucide-react';

interface CargoWalletViewProps {
  walletState: CargoWalletState;
  transactions: WalletTransaction[];
  onAddMoney: (amount: number, method: string, simulationMode: 'success' | 'failed' | 'pending') => void;
  isProcessing: boolean;
  onGoToBookings?: () => void;
}

export const CargoWalletView: React.FC<CargoWalletViewProps> = ({
  walletState,
  transactions,
  onAddMoney,
  isProcessing,
  onGoToBookings
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<WalletTransaction | null>(null);
  const [showAutoRechargeModal, setShowAutoRechargeModal] = useState<boolean>(false);
  const [autoRechargeEnabled, setAutoRechargeEnabled] = useState<boolean>(walletState.autoRechargeEnabled);

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = 
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.referenceId.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'successful') return tx.status === 'successful';
    if (activeFilter === 'pending') return tx.status === 'pending';
    if (activeFilter === 'failed') return tx.status === 'failed';
    if (activeFilter === 'freight') return tx.category === 'freight_charge' || tx.category === 'fuel_surcharge';
    if (activeFilter === 'topup') return tx.category === 'wallet_topup';

    return true;
  });

  const formattedBalance = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(walletState.availableBalance);

  const formattedFuelHold = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(walletState.fuelHoldBalance);

  // Export CSV
  const handleExportStatement = () => {
    const headers = ['Transaction ID', 'Date & Time', 'Type', 'Category', 'Description', 'Method', 'Reference UTR', 'Amount (INR)', 'Status'];
    const rows = filteredTransactions.map(tx => [
      tx.id,
      `"${tx.date}"`,
      tx.type,
      tx.category,
      `"${tx.description}"`,
      `"${tx.paymentMethod}"`,
      tx.referenceId,
      tx.amount,
      tx.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cargo_wallet_statement_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const scrollToRecharge = () => {
    const elem = document.getElementById('recharge-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: PROMINENT CURRENT WALLET BALANCE HERO CARD */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl">
        {/* Subtle decorative mesh gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Main Balance Display */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                CARGO & FREIGHT PREPAID WALLET
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400 font-mono">ID: CW-89104-IN</span>
            </div>

            <h1 className="text-xs text-slate-400 font-medium">Available Freight Balance</h1>
            
            <div className="flex items-baseline gap-3">
              <span className="text-4xl lg:text-5xl font-extrabold font-mono text-white tracking-tight tabular-nums">
                {formattedBalance}
              </span>
              <span className="px-2.5 py-1 bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 rounded-xl text-xs font-mono font-bold">
                ✓ Active for Dispatch
              </span>
            </div>

            <p className="text-xs text-slate-400 max-w-lg leading-relaxed pt-1">
              Zero-friction instant booking for FTL/LTL line-haul freight, refrigerated cold-chain, FASTag tolls, and delivery handling fees across all Indian metro corridors.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={scrollToRecharge}
              className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 active:scale-98 text-slate-950 font-extrabold text-sm rounded-2xl shadow-xl shadow-emerald-500/20 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Add Money</span>
            </button>

            <button
              onClick={() => setShowAutoRechargeModal(true)}
              className="flex items-center gap-2 px-4 py-3.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-2xl border border-slate-700 transition-colors"
            >
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Auto-Recharge: {autoRechargeEnabled ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={handleExportStatement}
              className="flex items-center gap-2 px-4 py-3.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-2xl border border-slate-700 transition-colors"
              title="Download Full Ledger Statement"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Statement</span>
            </button>
          </div>
        </div>

        {/* Secondary Logistics Reserves & Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-xs">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Fuel className="w-3.5 h-3.5 text-amber-400" />
              <span>Fuel & Toll Reserve Hold</span>
            </div>
            <span className="text-base font-bold font-mono text-white tabular-nums">
              {formattedFuelHold}
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Truck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Active Consignments</span>
            </div>
            <span className="text-base font-bold font-mono text-cyan-300 tabular-nums">
              14 Dispatches
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Payment Success Rate</span>
            </div>
            <span className="text-base font-bold font-mono text-emerald-400 tabular-nums">
              99.8%
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-300" />
              <span>Compliance & Safety</span>
            </div>
            <span className="text-xs font-semibold text-slate-200">
              RBI PPI & Escrow Guard
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 2: ADD MONEY INTERACTIVE CARD */}
      <div id="recharge-section">
        <AddMoneyCard
          onProcessPayment={onAddMoney}
          isProcessing={isProcessing}
          minLimit={walletState.minRecharge}
          maxLimit={walletState.maxRecharge}
        />
      </div>

      {/* SECTION 3: TRANSACTION HISTORY & LEDGER */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        {/* Table Header & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Cargo Wallet Transaction History</h3>
            <p className="text-xs text-slate-400">Complete audit trail of all top-ups, freight charges, tolls, and refunds</p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by TXN ID, method, description..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
          {[
            { id: 'all', label: 'All Transactions' },
            { id: 'topup', label: 'Wallet Top-ups (+)' },
            { id: 'freight', label: 'Freight Charges (-)' },
            { id: 'successful', label: 'Successful' },
            { id: 'pending', label: 'Pending' },
            { id: 'failed', label: 'Failed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/60 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Transactions High-Density Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
              <tr>
                <th className="py-3 px-4 font-semibold">DATE & TIME</th>
                <th className="py-3 px-4 font-semibold">TRANSACTION ID</th>
                <th className="py-3 px-4 font-semibold">DESCRIPTION / ROUTE</th>
                <th className="py-3 px-4 font-semibold">PAYMENT METHOD</th>
                <th className="py-3 px-4 font-semibold text-right">AMOUNT (₹)</th>
                <th className="py-3 px-4 font-semibold text-center">STATUS</th>
                <th className="py-3 px-4 font-semibold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Wallet className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p className="font-semibold text-white">No transactions found</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Try adjusting your filters or search terms</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isCredit = tx.type === 'credit';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Date */}
                      <td className="py-3.5 px-4 font-mono text-slate-300 text-[11px] whitespace-nowrap">
                        {tx.date}
                      </td>

                      {/* Transaction ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-300 whitespace-nowrap">
                        {tx.id}
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-white truncate">{tx.description}</div>
                        <div className="text-[10px] text-slate-500 font-mono">Ref: {tx.referenceId}</div>
                      </td>

                      {/* Method */}
                      <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                        {tx.paymentMethod}
                      </td>

                      {/* Amount */}
                      <td className={`py-3.5 px-4 font-mono font-bold text-right text-sm whitespace-nowrap ${
                        tx.status === 'failed' ? 'text-slate-500 line-through' :
                        isCredit ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isCredit ? '+' : '-'}₹{tx.amount.toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold border uppercase ${
                          tx.status === 'successful' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' :
                          tx.status === 'refunded' ? 'bg-blue-950/80 text-blue-300 border-blue-800' :
                          tx.status === 'pending' ? 'bg-amber-950/80 text-amber-300 border-amber-800' :
                          'bg-rose-950/80 text-rose-300 border-rose-800'
                        }`}>
                          {tx.status === 'successful' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                          {tx.status === 'pending' && <Clock className="w-3 h-3 text-amber-400 animate-spin" />}
                          {tx.status === 'failed' && <XCircle className="w-3 h-3 text-rose-400" />}
                          <span>{tx.status}</span>
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {tx.status === 'failed' ? (
                            <button
                              onClick={scrollToRecharge}
                              className="px-2.5 py-1 text-[11px] font-bold text-rose-300 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 rounded-lg transition-colors flex items-center gap-1"
                              title="Retry failed top-up"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Retry</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedReceiptTx(tx)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1 border border-slate-700/80"
                              title="View Tax Invoice & Receipt"
                            >
                              <FileText className="w-3 h-3 text-cyan-400" />
                              <span>Receipt</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 4: REFUND POLICY & CARGO TRUST GUARANTEES */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white tracking-tight">Cargo Wallet Refund & Protection Policy</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1.5">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 shrink-0" />
              <span>Failed Payment Auto-Reversal</span>
            </span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              If money is debited during a failed bank or UPI attempt, our payment switch triggers an automated reversal back to your source account within <strong>24 to 48 banking hours</strong> without requiring support tickets.
            </p>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1.5">
            <span className="font-bold text-cyan-300 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 shrink-0" />
              <span>Zero-Penalty Wallet Withdrawal</span>
            </span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Commercial customers can request voluntary withdrawal of unutilized prepaid wallet balances back to their verified corporate bank account anytime with <strong>0% cancellation deductions</strong> (processed in 3-5 business days).
            </p>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1.5">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>24/7 Cargo Billing Support</span>
            </span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              For any billing discrepancies, fuel surcharge adjustments, or invoice requests, reach our dedicated logistics desk at <strong className="text-white">1800-419-FLUX (Toll Free)</strong> or <strong className="text-cyan-300">cargo-billing@fluxroute.com</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* AUTO-RECHARGE CONFIGURATION MODAL */}
      {showAutoRechargeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">Cargo Auto-Recharge Settings</h3>
              </div>
              <button
                onClick={() => setShowAutoRechargeModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Prevent shipment dispatch holds by automatically topping up your wallet whenever available balance drops below your safety threshold.
            </p>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Enable Automated Recharge</span>
                <input
                  type="checkbox"
                  checked={autoRechargeEnabled}
                  onChange={(e) => setAutoRechargeEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">When balance falls below:</label>
                <div className="font-mono font-bold text-white text-sm">₹2,000.00</div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Auto-recharge amount:</label>
                <div className="font-mono font-bold text-emerald-400 text-sm">₹5,000.00 (via Primary Corporate UPI / Card)</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAutoRechargeModal(false)}
                className="px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAutoRechargeModal(false)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECEIPT MODAL */}
      {selectedReceiptTx && (
        <PaymentReceiptModal
          transaction={selectedReceiptTx}
          onClose={() => setSelectedReceiptTx(null)}
        />
      )}
    </div>
  );
};
