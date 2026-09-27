import React, { useState, useEffect } from 'react';
import { 
  WalletPaymentMethod, 
  WalletTransaction 
} from '../../types/wallet';
import { 
  CreditCard, 
  QrCode, 
  Building2, 
  Wallet as WalletIcon, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Check, 
  Smartphone, 
  AlertCircle, 
  Sparkles,
  Zap,
  Info
} from 'lucide-react';

interface AddMoneyCardProps {
  onProcessPayment: (amount: number, method: string, simulationMode: 'success' | 'failed' | 'pending') => void;
  isProcessing: boolean;
  minLimit: number;
  maxLimit: number;
}

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];

const POPULAR_BANKS = [
  { id: 'hdfc', name: 'HDFC Bank', code: 'HDFC' },
  { id: 'icici', name: 'ICICI Bank', code: 'ICICI' },
  { id: 'sbi', name: 'State Bank of India', code: 'SBI' },
  { id: 'axis', name: 'Axis Bank', code: 'AXIS' },
  { id: 'kotak', name: 'Kotak Mahindra Bank', code: 'KOTAK' },
  { id: 'pnb', name: 'Punjab National Bank', code: 'PNB' }
];

const OTHER_BANKS = [
  'Bank of Baroda',
  'Canara Bank',
  'Union Bank of India',
  'IndusInd Bank',
  'Federal Bank',
  'IDFC FIRST Bank',
  'Yes Bank',
  'Indian Bank',
  'Central Bank of India'
];

export const AddMoneyCard: React.FC<AddMoneyCardProps> = ({
  onProcessPayment,
  isProcessing,
  minLimit = 100,
  maxLimit = 100000
}) => {
  const [amount, setAmount] = useState<number>(2000);
  const [selectedMethod, setSelectedMethod] = useState<WalletPaymentMethod>('upi');
  const [simulationMode, setSimulationMode] = useState<'success' | 'failed' | 'pending'>('success');
  
  // UPI State
  const [upiOption, setUpiOption] = useState<'qr' | 'vpa'>('qr');
  const [vpaInput, setVpaInput] = useState<string>('fluxroute.cargo@okhdfcbank');
  const [isVpaVerified, setIsVpaVerified] = useState<boolean>(true);
  const [qrCountdown, setQrCountdown] = useState<number>(300); // 5 mins in seconds
  const [copiedUpiId, setCopiedUpiId] = useState<boolean>(false);

  // Card State
  const [cardNumber, setCardNumber] = useState<string>('4532 8901 2345 6789');
  const [cardHolder, setCardHolder] = useState<string>('SHIVA LOGISTICS ENT');
  const [cardExpiry, setCardExpiry] = useState<string>('08/29');
  const [cardCvv, setCardCvv] = useState<string>('842');
  const [saveCard, setSaveCard] = useState<boolean>(true);

  // Net Banking State
  const [selectedBank, setSelectedBank] = useState<string>('hdfc');

  // Digital Wallet State
  const [selectedWalletApp, setSelectedWalletApp] = useState<string>('amazon_pay');

  // Format amount input
  const isAmountValid = amount >= minLimit && amount <= maxLimit;

  // QR Countdown Timer
  useEffect(() => {
    if (selectedMethod !== 'upi' || upiOption !== 'qr') return;
    const timer = setInterval(() => {
      setQrCountdown((prev) => (prev > 0 ? prev - 1 : 300));
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedMethod, upiOption]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('cargo.pay@fluxroute');
    setCopiedUpiId(true);
    setTimeout(() => setCopiedUpiId(false), 2000);
  };

  const handleQuickAmountClick = (val: number) => {
    setAmount(val);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').substring(0, 16);
    const parts = raw.match(/.{1,4}/g);
    setCardNumber(parts ? parts.join(' ') : raw);
  };

  const getMethodNameString = () => {
    if (selectedMethod === 'upi') {
      return upiOption === 'qr' ? 'UPI Dynamic QR (GPay/PhonePe)' : `UPI VPA (${vpaInput})`;
    }
    if (selectedMethod === 'card') {
      return `Credit/Debit Card (ending ${cardNumber.slice(-4) || '6789'})`;
    }
    if (selectedMethod === 'netbanking') {
      const b = POPULAR_BANKS.find(bank => bank.id === selectedBank);
      return `Net Banking (${b ? b.name : selectedBank})`;
    }
    return `Digital Wallet (${selectedWalletApp.replace('_', ' ').toUpperCase()})`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAmountValid || isProcessing) return;
    onProcessPayment(amount, getMethodNameString(), simulationMode);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Top Banner */}
      <div className="p-6 border-b border-slate-800 bg-slate-950/70">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20">
              ₹
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Add Money to Cargo Wallet</h2>
              <p className="text-xs text-slate-400">
                Instant zero-fee prepayment for freight bookings, fuel surcharges & highway tolls
              </p>
            </div>
          </div>

          {/* Limits Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Limit: <strong className="text-white">₹{minLimit}</strong> to <strong className="text-white">₹{maxLimit.toLocaleString()}</strong></span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Step 1: Amount Selection */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block font-mono">
            1. Enter Recharge Amount (INR)
          </label>

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold font-mono text-emerald-400">
              ₹
            </div>
            <input
              type="number"
              min={minLimit}
              max={maxLimit}
              step="50"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Enter amount (e.g. 5000)"
              className="w-full pl-11 pr-4 py-3.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-2xl text-2xl font-bold font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          {/* Quick Amount Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-mono text-slate-500 mr-1">Quick Select:</span>
            {QUICK_AMOUNTS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleQuickAmountClick(val)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  amount === val
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 scale-102'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                ₹{val.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Validation Alert */}
          {!isAmountValid && (
            <p className="text-xs text-rose-400 flex items-center gap-1.5 font-mono">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Please enter an amount between ₹{minLimit} and ₹{maxLimit.toLocaleString()}</span>
            </p>
          )}

          {/* Logistics Perk Notice */}
          {amount >= 5000 && (
            <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Commercial Partner Perk: Eligible for <strong>Priority Fleet Allocation & 0% Payment Surcharge</strong> on line-haul consignments.</span>
            </div>
          )}
        </div>

        {/* Step 2: Payment Methods */}
        <div className="space-y-4 pt-2 border-t border-slate-800">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block font-mono">
            2. Choose Payment Mode
          </label>

          {/* Method Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'upi', label: 'UPI / QR Code', icon: QrCode, badge: 'Instant 0% Fee' },
              { id: 'card', label: 'Debit / Credit Card', icon: CreditCard, badge: 'Visa/RuPay' },
              { id: 'netbanking', label: 'Net Banking', icon: Building2, badge: 'All Banks' },
              { id: 'wallet', label: 'Digital Wallets', icon: WalletIcon, badge: 'Amazon/Paytm' },
            ].map((method) => {
              const Icon = method.icon;
              const isSelected = selectedMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedMethod(method.id as WalletPaymentMethod)}
                  className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-800/90 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/60 text-slate-300">
                      {method.badge}
                    </span>
                  </div>
                  <span className={`text-xs font-bold mt-2 ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {method.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Payment Method View Body */}
          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
            {/* UPI SUB-VIEW */}
            {selectedMethod === 'upi' && (
              <div className="space-y-4">
                {/* UPI Sub-tabs: QR Code vs Enter VPA */}
                <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800 max-w-xs text-xs">
                  <button
                    type="button"
                    onClick={() => setUpiOption('qr')}
                    className={`flex-1 py-1.5 rounded-lg font-semibold transition-colors ${
                      upiOption === 'qr' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Scan QR Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpiOption('vpa')}
                    className={`flex-1 py-1.5 rounded-lg font-semibold transition-colors ${
                      upiOption === 'vpa' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Enter UPI ID / VPA
                  </button>
                </div>

                {upiOption === 'qr' ? (
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-900/60 rounded-2xl border border-slate-800/80">
                    {/* Simulated Dynamic UPI QR Matrix */}
                    <div className="p-3 bg-white rounded-2xl shadow-xl flex flex-col items-center shrink-0">
                      <svg
                        viewBox="0 0 140 140"
                        className="w-36 h-36"
                        fill="#0f172a"
                      >
                        {/* Decorative simulated QR Matrix */}
                        <rect width="140" height="140" fill="#ffffff" />
                        {/* Corner Targets */}
                        <rect x="10" y="10" width="35" height="35" rx="6" fill="#0f172a" />
                        <rect x="16" y="16" width="23" height="23" rx="4" fill="#ffffff" />
                        <rect x="22" y="22" width="11" height="11" rx="2" fill="#0f172a" />

                        <rect x="95" y="10" width="35" height="35" rx="6" fill="#0f172a" />
                        <rect x="101" y="16" width="23" height="23" rx="4" fill="#ffffff" />
                        <rect x="107" y="22" width="11" height="11" rx="2" fill="#0f172a" />

                        <rect x="10" y="95" width="35" height="35" rx="6" fill="#0f172a" />
                        <rect x="16" y="101" width="23" height="23" rx="4" fill="#ffffff" />
                        <rect x="22" y="107" width="11" height="11" rx="2" fill="#0f172a" />

                        {/* Random Data Elements */}
                        <rect x="52" y="14" width="8" height="8" />
                        <rect x="66" y="14" width="8" height="8" />
                        <rect x="78" y="22" width="8" height="8" />
                        <rect x="52" y="32" width="16" height="8" />
                        
                        <rect x="14" y="52" width="8" height="16" />
                        <rect x="30" y="60" width="12" height="8" />
                        <rect x="48" y="48" width="16" height="16" fill="#059669" />
                        <rect x="70" y="52" width="8" height="12" />
                        <rect x="84" y="48" width="12" height="16" />
                        <rect x="102" y="60" width="16" height="8" />
                        <rect x="122" y="52" width="8" height="16" />

                        <rect x="52" y="72" width="12" height="8" />
                        <rect x="70" y="72" width="16" height="16" />
                        <rect x="92" y="78" width="8" height="8" />

                        <rect x="52" y="94" width="14" height="14" />
                        <rect x="72" y="98" width="8" height="16" />
                        <rect x="88" y="94" width="14" height="8" />
                        <rect x="110" y="102" width="12" height="12" />
                        <rect x="66" y="118" width="16" height="8" />
                        <rect x="90" y="114" width="8" height="14" />
                      </svg>
                      <div className="flex items-center gap-1.5 mt-2 text-[10px] font-mono font-bold text-slate-800">
                        <span>BHIM</span> · <span>UPI</span> · <span>GPay</span>
                      </div>
                    </div>

                    {/* QR Instructions */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>QR Expires in: <strong className="font-mono text-amber-300">{formatTimer(qrCountdown)}</strong></span>
                      </div>
                      <p className="text-slate-400 leading-relaxed text-[11px]">
                        Scan this QR using Google Pay, PhonePe, Paytm, BHIM, CRED or any banking UPI app. Amount <strong className="text-white font-mono">₹{amount.toLocaleString()}</strong> will be automatically populated.
                      </p>

                      <div className="pt-2 flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-500">Merchant UPI VPA:</span>
                        <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-200">
                          <span>cargo.pay@fluxroute</span>
                          <button
                            type="button"
                            onClick={handleCopyUpi}
                            className="text-cyan-400 hover:text-cyan-300 ml-1"
                            title="Copy UPI ID"
                          >
                            {copiedUpiId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="text-xs text-slate-300 block font-medium">
                      Enter your UPI ID / Virtual Payment Address (VPA)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={vpaInput}
                        onChange={(e) => setVpaInput(e.target.value)}
                        placeholder="e.g. yourname@okhdfcbank"
                        className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setIsVpaVerified(true)}
                        className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors whitespace-nowrap"
                      >
                        Verify
                      </button>
                    </div>
                    {isVpaVerified && (
                      <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>VPA Verified: Shiva Logistics Enterprises (HDFC Bank Ltd)</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* CARD SUB-VIEW */}
            {selectedMethod === 'card' && (
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-medium">Card Number</label>
                    <span className="text-[10px] font-mono text-slate-500">Supports Visa, RuPay & MasterCard</span>
                  </div>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    maxLength={19}
                    placeholder="4532 8901 2345 6789"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Name on Card</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="Enter cardholder name"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500 uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Expiry Date</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      maxLength={5}
                      placeholder="MM/YY"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 font-mono text-xs text-center placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-medium block mb-1">CVV / CVC</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      maxLength={4}
                      placeholder="•••"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 font-mono text-xs text-center placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-300">
                    <input
                      type="checkbox"
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-emerald-500 bg-slate-900 border-slate-700"
                    />
                    <span>Save card securely as per RBI tokenization guidelines</span>
                  </label>
                </div>
              </div>
            )}

            {/* NET BANKING SUB-VIEW */}
            {selectedMethod === 'netbanking' && (
              <div className="space-y-4">
                <span className="text-xs text-slate-300 block font-medium">Popular Commercial Banks:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {POPULAR_BANKS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBank(b.id)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                        selectedBank === b.id
                          ? 'bg-slate-800 text-emerald-400 border-emerald-500'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{b.name}</span>
                        <span className="text-[10px] font-mono text-slate-500">{b.code}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="text-xs text-slate-400 block mb-1">Or choose other Indian bank:</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="" disabled>-- Select from 50+ Banks --</option>
                    {OTHER_BANKS.map((bank) => (
                      <option key={bank} value={bank}>{bank}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* WALLET SUB-VIEW */}
            {selectedMethod === 'wallet' && (
              <div className="space-y-3">
                <span className="text-xs text-slate-300 block font-medium">Select Digital Wallet:</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'amazon_pay', name: 'Amazon Pay Balance', cashback: '₹50 flat cashback' },
                    { id: 'paytm_wallet', name: 'Paytm Wallet', cashback: 'Instant link' },
                    { id: 'mobikwik', name: 'MobiKwik ZIP', cashback: 'Pay Later eligible' },
                    { id: 'airtel_money', name: 'Airtel Payments Bank', cashback: '0% fees' },
                  ].map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setSelectedWalletApp(w.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedWalletApp === w.id
                          ? 'bg-slate-800 text-emerald-400 border-emerald-500'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold block text-white">{w.name}</span>
                      <span className="text-[10px] text-emerald-400 font-mono">{w.cashback}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Breakdown & Simulation Mode Controls */}
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center justify-between text-slate-400 font-mono">
            <span>Recharge Subtotal:</span>
            <span className="text-white font-bold">₹{amount.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between text-slate-400 font-mono">
            <span>Payment Processing Fee:</span>
            <span className="text-emerald-400 font-bold">₹0.00 (Waived for Cargo Clients)</span>
          </div>

          <div className="flex items-center justify-between text-slate-400 font-mono">
            <span>GST on Wallet Deposit:</span>
            <span className="text-slate-300">₹0.00 (Invoiced on shipment booking)</span>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-sm font-bold">
            <span className="text-white">Total Amount Payable:</span>
            <span className="text-emerald-400 font-mono text-lg">₹{amount.toLocaleString()}</span>
          </div>

          {/* Developer / Evaluation Simulator Mode */}
          <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <span className="text-slate-500 font-mono">Payment Gateway Simulation:</span>
            <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 font-mono">
              <button
                type="button"
                onClick={() => setSimulationMode('success')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  simulationMode === 'success' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                ● Success
              </button>
              <button
                type="button"
                onClick={() => setSimulationMode('failed')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  simulationMode === 'failed' ? 'bg-rose-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                ● Fail (Timeout)
              </button>
              <button
                type="button"
                onClick={() => setSimulationMode('pending')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  simulationMode === 'pending' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                ● Pending
              </button>
            </div>
          </div>
        </div>

        {/* Primary CTA & Trust Badges */}
        <div className="space-y-4">
          <button
            type="submit"
            disabled={!isAmountValid || isProcessing}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 active:scale-98 text-slate-950 text-sm font-extrabold rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Processing Secure Payment of ₹{amount.toLocaleString()}...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Pay ₹{amount.toLocaleString()} & Add to Cargo Wallet</span>
              </>
            )}
          </button>

          {/* Trust & Compliance Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center text-[10px] text-slate-500 font-mono">
            <div className="flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>256-Bit SSL Encrypted</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>PCI-DSS Level 1</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>RBI PPI Compliant</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Instant Credit & ITC</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
