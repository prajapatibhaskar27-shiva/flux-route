import React from 'react';
import { WalletTransaction } from '../../types/wallet';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  X, 
  ArrowRight, 
  RotateCcw, 
  FileText, 
  ShieldCheck, 
  Wallet,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';

interface PaymentResultModalProps {
  transaction: WalletTransaction;
  newWalletBalance: number;
  onClose: () => void;
  onRetry: () => void;
  onViewReceipt: (tx: WalletTransaction) => void;
  onGoToBookings?: () => void;
}

export const PaymentResultModal: React.FC<PaymentResultModalProps> = ({
  transaction,
  newWalletBalance,
  onClose,
  onRetry,
  onViewReceipt,
  onGoToBookings
}) => {
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(transaction.amount);

  const formattedBalance = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(newWalletBalance);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Close Button */}
        <div className="p-4 flex justify-end">
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 pb-6 pt-0 text-center space-y-4">
          {/* SUCCESS STATE */}
          {transaction.status === 'successful' && (
            <>
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                  TRANSACTION CONFIRMED
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  Payment Successful!
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  <span className="font-bold text-white font-mono">{formattedAmount}</span> has been credited to your Cargo Wallet
                </p>
              </div>

              {/* Updated Balance Card */}
              <div className="p-4 bg-gradient-to-br from-emerald-950/40 to-slate-950 rounded-2xl border border-emerald-900/60 text-center">
                <span className="text-[11px] text-slate-400 block font-medium flex items-center justify-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Updated Cargo Wallet Balance</span>
                </span>
                <div className="text-2xl font-extrabold font-mono text-emerald-300 mt-1">
                  {formattedBalance}
                </div>
                <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">
                  ✓ Available immediately for freight booking, toll, & fuel charges
                </span>
              </div>

              {/* Transaction Mini Details */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-left space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Transaction ID:</span>
                  <span className="text-cyan-300 font-bold">{transaction.id}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Payment Mode:</span>
                  <span className="text-white">{transaction.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Reference UTR:</span>
                  <span className="text-slate-300">{transaction.referenceId}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Time:</span>
                  <span className="text-slate-300">{transaction.date}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => onViewReceipt(transaction)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>View / Download Tax Receipt</span>
                </button>

                {onGoToBookings && (
                  <button
                    onClick={onGoToBookings}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Book Freight Consignment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="w-full py-2 text-slate-400 hover:text-white text-xs font-medium transition-colors"
                >
                  Done
                </button>
              </div>
            </>
          )}

          {/* FAILED STATE */}
          {transaction.status === 'failed' && (
            <>
              <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
                <XCircle className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[11px] font-mono font-bold text-rose-400 uppercase tracking-wider block">
                  PAYMENT FAILED
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  Recharge Unsuccessful
                </h3>
                <p className="text-xs text-rose-300 mt-1 bg-rose-950/40 border border-rose-900/50 p-2.5 rounded-xl">
                  {transaction.failureReason || 'Bank gateway timed out during authentication. No funds were debited.'}
                </p>
              </div>

              {/* Safety Guarantee Callout */}
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-left text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>100% Safe Money Assurance</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  If any money was debited from your bank account or UPI, your issuing bank will automatically reverse and refund it within 24 to 48 banking hours.
                </p>
              </div>

              {/* Transaction Meta */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-left space-y-1 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Failed TXN ID:</span>
                  <span className="text-rose-300">{transaction.id}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Attempted Method:</span>
                  <span className="text-white">{transaction.paymentMethod}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={onRetry}
                  className="w-full py-2.5 bg-rose-500 hover:bg-rose-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Payment Now</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
                >
                  Change Payment Method
                </button>
              </div>
            </>
          )}

          {/* PENDING STATE */}
          {transaction.status === 'pending' && (
            <>
              <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
                <Clock className="w-8 h-8 animate-spin" style={{ animationDuration: '4s' }} />
              </div>

              <div>
                <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                  PAYMENT PROCESSING
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  Awaiting Bank Confirmation
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  We have requested confirmation for <span className="font-bold text-white font-mono">{formattedAmount}</span>.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-left text-xs space-y-1">
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  UPI / Bank clearing usually takes between 30 seconds to 5 minutes. Your Cargo Wallet balance will update automatically as soon as settlement is received.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={onRetry}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Refresh Transaction Status</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-2 text-slate-400 hover:text-white text-xs font-medium transition-colors"
                >
                  Close & Check Later
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
