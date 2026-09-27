import React from 'react';
import { WalletTransaction } from '../../types/wallet';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  Building2, 
  ShieldCheck, 
  FileText,
  Truck
} from 'lucide-react';

interface PaymentReceiptModalProps {
  transaction: WalletTransaction;
  onClose: () => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  transaction,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(transaction.amount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with Print & Close */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Payment Receipt & Tax Invoice</h2>
              <p className="text-[11px] text-slate-400 font-mono">Invoice #{transaction.taxInvoiceNo || `INV-${transaction.id}`}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
              title="Print Receipt or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200 text-xs bg-slate-900 printable-receipt">
          {/* Invoice Top Brand Header */}
          <div className="flex items-start justify-between border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2 text-white font-extrabold text-base tracking-tight">
                <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs">
                  ⚡
                </div>
                <span>FluxRoute Cargo Logistics Pvt. Ltd.</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Logistics Tower, 7th Floor, Bandra-Kurla Complex (BKC)<br />
                Mumbai, Maharashtra 400051, India<br />
                <span className="font-mono text-cyan-400">GSTIN: 27AABCF1234F1Z8</span> · PAN: AABCF1234F
              </p>
            </div>

            <div className="text-right">
              <span className={`inline-block px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg border uppercase ${
                transaction.status === 'successful' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' :
                transaction.status === 'refunded' ? 'bg-blue-950/80 text-blue-300 border-blue-800' :
                transaction.status === 'pending' ? 'bg-amber-950/80 text-amber-300 border-amber-800' :
                'bg-rose-950/80 text-rose-300 border-rose-800'
              }`}>
                {transaction.status}
              </span>
              <p className="text-[11px] font-mono text-slate-400 mt-1.5">
                Date: {transaction.date}
              </p>
            </div>
          </div>

          {/* Customer & Transaction Meta */}
          <div className="grid grid-cols-2 gap-4 p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 text-[11px]">
            <div>
              <span className="text-slate-400 block font-medium">Billed To (Customer):</span>
              <span className="font-bold text-white block mt-0.5">
                {transaction.customerName || 'Shiva Logistics & Freight Enterprises'}
              </span>
              <span className="text-slate-400 block font-mono">
                GSTIN: {transaction.customerGstin || '27AABCS1429E1Z2'}
              </span>
              <span className="text-slate-500 block">Verified Logistics Partner (Tier 1)</span>
            </div>

            <div className="space-y-1">
              <div>
                <span className="text-slate-400 font-medium">Transaction ID: </span>
                <span className="font-mono font-bold text-cyan-300">{transaction.id}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Payment Mode: </span>
                <span className="font-mono text-white">{transaction.paymentMethod}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Ref / UTR No: </span>
                <span className="font-mono text-slate-300">{transaction.referenceId}</span>
              </div>
            </div>
          </div>

          {/* Itemized Line Items Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">DESCRIPTION</th>
                  <th className="py-2.5 px-3">SAC CODE</th>
                  <th className="py-2.5 px-3 text-right">TAX RATE</th>
                  <th className="py-2.5 px-3 text-right">AMOUNT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                <tr>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-white">{transaction.description}</div>
                    <div className="text-[10px] text-slate-400">Prepaid Cargo Freight & Dispatch Wallet Credit</div>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300">996511</td>
                  <td className="py-3 px-3 text-right font-mono text-slate-400">0.00% *</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-white">
                    {formattedAmount}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="flex flex-col items-end space-y-1.5 text-xs font-mono pt-2 border-t border-slate-800">
            <div className="flex justify-between w-64 text-slate-400">
              <span>Subtotal:</span>
              <span className="text-white">{formattedAmount}</span>
            </div>
            <div className="flex justify-between w-64 text-slate-400">
              <span>Convenience Fee:</span>
              <span className="text-emerald-400">₹0.00 (Waived)</span>
            </div>
            <div className="flex justify-between w-64 text-slate-400">
              <span>GST (Deposit Stage):</span>
              <span className="text-slate-300">₹0.00 *</span>
            </div>
            <div className="flex justify-between w-64 pt-2 border-t border-slate-800 font-bold text-sm text-cyan-300">
              <span>Total Paid:</span>
              <span>{formattedAmount}</span>
            </div>
          </div>

          {/* Legal / Tax Note */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[10px] text-slate-400 leading-relaxed">
            <p>* As per GST Rule 46, deposits to prepaid freight cargo wallets are non-taxable at the deposit stage. Tax invoices (CGST/SGST/IGST @ 5%/18%) with input tax credit (ITC) are automatically generated upon actual shipment booking and dispatch consumption.</p>
          </div>

          {/* Footer with Security Badge */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Digitally Authenticated by FluxRoute Settlement Switch</span>
            </div>
            <span className="font-mono">Page 1 of 1</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
          <span className="text-slate-500">Need billing assistance? Contact 1800-419-FLUX</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
};
