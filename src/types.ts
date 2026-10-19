export interface Department {
  id: string;
  name: string;
  icon: string;
  color?: string;
}

export const DEPARTMENTS: Department[] = [
  { id: 'cards', name: 'Greeting Cards', icon: '💌', color: '#00d2d3' },
  { id: 'wrap', name: 'Gift Wrap & Bags', icon: '🎁', color: '#ff9f43' },
  { id: 'plush', name: 'Plush & Toys', icon: '🧸', color: '#ee5253' },
  { id: 'candles', name: 'Candles & Home', icon: '🕯️', color: '#f39c12' },
  { id: 'holiday', name: 'Holiday & Seasonal', icon: '🎄', color: '#10ac84' },
  { id: 'balloons', name: 'Balloons & Party', icon: '🎈', color: '#ec4899' },
  { id: 'stationery', name: 'Stationery & Pens', icon: '✒️', color: '#3b82f6' },
  { id: 'novelty', name: 'Novelty & Gifts', icon: '✨', color: '#8b5cf6' },
  { id: 'general', name: 'General Merchandise', icon: '📦', color: '#a2a2c2' },
];

export interface Product {
  id: string;
  name: string;
  category: string;
  department?: string;
  price: number;
  barcode: string;
  code?: string; // e.g. "Tier A", "Tier B", "Gold", "Wrap"
  color?: string;
  icon?: string;
  stock?: number;
  description?: string;
}

export interface CartItem extends Product {
  cartItemId: string; // unique per cart line
  qty: number;
  discount: number; // percentage, e.g. 50
  discountType?: 'percent' | 'fixed';
  manualDiscountAmount?: number;
  department?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  timestamp: number;
  items: CartItem[];
  subtotal: number;
  discountTotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'split' | 'giftcard';
  tenderedAmount: number;
  changeDue: number;
  cashierName: string;
  status: 'completed' | 'refunded';
  zReportId?: string; // tagged when closed out in a Z-report
  refundTimestamp?: number;
  refundReason?: string;
  refundedBy?: string;
  refundMethod?: 'cash' | 'card' | 'storecredit';
}

export interface CashierProfile {
  id: string;
  name: string;
  role: 'Cashier' | 'Manager' | 'Store Owner';
  pin?: string;
  color?: string;
  active: boolean;
}

export interface StoreProfile {
  storeName: string;
  tagline: string;
  ownerName: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  currencySymbol: string;
}

export interface ReceiptSettings {
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  taxId: string;
  taxRate: number; // e.g. 0.08 for 8%
  headerNote: string;
  footerNote1: string;
  footerNote2: string;
  showBarcode: boolean;
  showCashier: boolean;
  showItemCode: boolean;
}

export interface ZReport {
  id: string;
  zNumber: string; // e.g. "Z-0001"
  closedAt: number;
  closedBy: string;
  startingFloat: number;
  cashSales: number;
  cardSales: number;
  giftCardSales: number;
  grossSales: number;
  discountsTotal: number;
  taxTotal: number;
  netTotal: number;
  expectedCashInDrawer: number;
  actualCashCounted: number;
  overShortDifference: number;
  transactionCount: number;
  refundCount: number;
  refundTotal: number;
  firstOrderTime?: number;
  lastOrderTime?: number;
}

export type CategoryId =
  | 'all'
  | 'price-codes'
  | 'birthday'
  | 'holiday'
  | 'anniversary'
  | 'sympathy'
  | 'wrap'
  | 'plush'
  | 'candles'
  | 'novelty';
