import { ReceiptSettings } from '../types';

export const DEFAULT_RECEIPT_SETTINGS: ReceiptSettings = {
  storeName: 'GREETING CARDS & GIFTS',
  tagline: 'The Joy of Giving Store',
  address: '123 Celebrations Way, Suite 101',
  phone: '(555) 234-5678',
  taxId: 'TAX-892147-G',
  taxRate: 0.08,
  headerNote: 'Welcome to our card shop!',
  footerNote1: 'Thank you for sharing joy with greeting cards!',
  footerNote2: 'Returns accepted within 14 days with receipt and undamaged items.',
  showBarcode: true,
  showCashier: true,
  showItemCode: true,
};
