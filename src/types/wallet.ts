export type WalletPaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet';

export type TransactionStatus = 'successful' | 'pending' | 'failed' | 'refunded';

export type TransactionCategory = 
  | 'wallet_topup' 
  | 'freight_charge' 
  | 'fuel_surcharge' 
  | 'handling_fee' 
  | 'refund';

export interface WalletTransaction {
  id: string;
  date: string;
  timestamp: number;
  amount: number; // in INR
  type: 'credit' | 'debit';
  category: TransactionCategory;
  paymentMethod: string;
  status: TransactionStatus;
  referenceId: string;
  description: string;
  failureReason?: string;
  taxInvoiceNo?: string;
  customerName?: string;
  customerGstin?: string;
}

export interface CargoWalletState {
  availableBalance: number;
  fuelHoldBalance: number;
  pendingClearanceBalance: number;
  currency: string;
  minRecharge: number;
  maxRecharge: number;
  autoRechargeEnabled: boolean;
  autoRechargeThreshold: number;
  autoRechargeAmount: number;
}
