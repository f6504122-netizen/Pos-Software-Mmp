/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  FileText,
  Package,
  Settings,
  HelpCircle,
  Store,
  Clock,
  User,
  Monitor,
  Printer,
  Unlock,
  RotateCcw,
  Users,
} from 'lucide-react';
import {
  Product,
  CartItem,
  Order,
  ZReport,
  ReceiptSettings,
  CashierProfile,
  StoreProfile,
} from './types';
import { INITIAL_PRODUCTS } from './data/initialProducts';
import { DEFAULT_RECEIPT_SETTINGS } from './data/defaultReceiptSettings';
import { LeftPanelCatalog } from './components/LeftPanelCatalog';
import { RightPanelCart } from './components/RightPanelCart';
import { PaymentModal } from './components/PaymentModal';
import { ReceiptModal } from './components/ReceiptModal';
import { OpenPriceModal } from './components/OpenPriceModal';
import { ReportsModal } from './components/ReportsModal';
import { InventoryModal } from './components/InventoryModal';
import { CustomizeReceiptModal } from './components/CustomizeReceiptModal';
import { WindowsExeModal } from './components/WindowsExeModal';
import { PrinterModal } from './components/PrinterModal';
import { RefundModal } from './components/RefundModal';
import { SettingsModal } from './components/SettingsModal';
import {
  playToggleChime,
  playCashRegisterDing,
  setSoundEnabled,
} from './utils/audio';
import {
  DEFAULT_PRINTER_SETTINGS,
  PrinterSettings,
  getAvailablePrinters,
  printReceiptDocument,
  triggerCashDrawerKick,
} from './utils/printerService';

const STORAGE_KEYS = {
  PRODUCTS: 'greeting_pos_clean_products_v2',
  ORDERS: 'greeting_pos_clean_orders_v2',
  RECEIPT_SETTINGS: 'greeting_pos_receipt_settings_v2',
  Z_REPORTS: 'greeting_pos_zreports_v2',
  PRINTER_SETTINGS: 'greeting_pos_printer_settings_v2',
  STORE_PROFILE: 'greeting_pos_store_profile_v2',
  CASHIERS: 'greeting_pos_cashiers_v2',
};

const DEFAULT_STORE_PROFILE: StoreProfile = {
  storeName: 'Greeting Cards & Gift Shop',
  tagline: 'The Joy of Giving Store',
  ownerName: 'Store Manager',
  address: '123 Celebrations Way, Suite 101',
  phone: '(555) 234-5678',
  email: 'cards@giftstore.com',
  taxId: 'TAX-892147-G',
  currencySymbol: '$',
};

const DEFAULT_CASHIERS: CashierProfile[] = [
  { id: 'c1', name: 'Cashier #01', role: 'Cashier', active: true, color: '#10b981' },
  { id: 'c2', name: 'Manager Alex', role: 'Manager', active: true, color: '#8b5cf6' },
];

export default function App() {
  // Store Profile
  const [storeProfile, setStoreProfile] = useState<StoreProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STORE_PROFILE);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_STORE_PROFILE;
  });

  // Staff / Cashiers Profiles
  const [cashiers, setCashiers] = useState<CashierProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CASHIERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_CASHIERS;
  });

  const [activeCashier, setActiveCashier] = useState<string>(() => {
    return cashiers[0]?.name || 'Cashier #01';
  });

  // Clean products catalog for new user
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_PRODUCTS;
  });

  // Receipt configuration
  const [receiptSettings, setReceiptSettings] = useState<ReceiptSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RECEIPT_SETTINGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_RECEIPT_SETTINGS;
  });

  // Windows Printer Settings
  const [printerSettings, setPrinterSettings] = useState<PrinterSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRINTER_SETTINGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_PRINTER_SETTINGS;
  });

  // Active Cart State (Docked on RIGHT side)
  const [cart, setCart] = useState<CartItem[]>([]);
  const [is50Active, setIs50Active] = useState<boolean>(false);
  const [numpadVal, setNumpadVal] = useState<string>('');

  // UI state
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [drawerAlert, setDrawerAlert] = useState<string | null>(null);

  // Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isOpenPriceModalOpen, setIsOpenPriceModalOpen] = useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isCustomizeReceiptOpen, setIsCustomizeReceiptOpen] = useState(false);
  const [isWindowsExeModalOpen, setIsWindowsExeModalOpen] = useState(false);
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Orders History
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  // Daily Z-Reports Closeout Log
  const [zReports, setZReports] = useState<ZReport[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.Z_REPORTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  const [activeReceiptOrder, setActiveReceiptOrder] = useState<Order | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STORE_PROFILE, JSON.stringify(storeProfile));
  }, [storeProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CASHIERS, JSON.stringify(cashiers));
  }, [cashiers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECEIPT_SETTINGS, JSON.stringify(receiptSettings));
  }, [receiptSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.Z_REPORTS, JSON.stringify(zReports));
  }, [zReports]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRINTER_SETTINGS, JSON.stringify(printerSettings));
  }, [printerSettings]);

  // Automatic Windows printer auto-detect on startup
  useEffect(() => {
    if (printerSettings.autoConnect) {
      getAvailablePrinters().then((printers) => {
        if (printers.length > 0 && printerSettings.selectedPrinter === 'auto-windows-default') {
          const defaultOne = printers.find((p) => p.isDefault) || printers[0];
          if (defaultOne) {
            setPrinterSettings((prev) => ({
              ...prev,
              selectedPrinter: defaultOne.name,
            }));
          }
        }
      });
    }
  }, [printerSettings.autoConnect, printerSettings.selectedPrinter]);

  // Real-time Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Audio toggle
  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Dedicated Cash Drawer Open Function
  const handleOpenCashDrawer = useCallback(() => {
    playCashRegisterDing();
    triggerCashDrawerKick(printerSettings.selectedPrinter);
    setDrawerAlert('Cash Drawer Opened (No-Sale Event Logged)');
    setTimeout(() => setDrawerAlert(null), 2500);
  }, [printerSettings.selectedPrinter]);

  // 50% Discount Toggle
  const handleToggle50Discount = useCallback(() => {
    setIs50Active((prev) => !prev);
  }, []);

  // Add product to Cart (detects unit price from numpad if active)
  const handleAddToCart = useCallback(
    (product: Product, overridePrice?: number) => {
      // Check if numpad has an active price entered
      const clean = numpadVal.replace(/\D/g, '').replace(/^0+/, '');
      const numpadPrice = clean ? parseInt(clean, 10) / 100 : null;

      const effectiveUnitPrice =
        overridePrice !== undefined
          ? overridePrice
          : numpadPrice && numpadPrice > 0
          ? numpadPrice
          : product.price;

      const discount = is50Active ? 50 : 0;
      setCart((prevCart) => {
        const existingIndex = prevCart.findIndex(
          (item) =>
            item.id === product.id &&
            Math.abs(item.price - effectiveUnitPrice) < 0.005 &&
            item.discount === discount
        );

        if (existingIndex > -1) {
          const updated = [...prevCart];
          updated[existingIndex] = {
            ...updated[existingIndex],
            qty: updated[existingIndex].qty + 1,
          };
          return updated;
        }

        const newLine: CartItem = {
          ...product,
          price: effectiveUnitPrice,
          cartItemId: `${product.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          qty: 1,
          discount: discount,
        };
        return [...prevCart, newLine];
      });

      // Clear numpad if it was used to set the unit price
      if (numpadPrice && numpadPrice > 0) {
        setNumpadVal('');
      }
    },
    [is50Active, numpadVal]
  );

  // Quick Price Tier Tap (detects unit price from numpad if active)
  const handleQuickPriceTier = useCallback(
    (code: string, price: number, name: string) => {
      const clean = numpadVal.replace(/\D/g, '').replace(/^0+/, '');
      const numpadPrice = clean ? parseInt(clean, 10) / 100 : null;
      const effectivePrice = numpadPrice && numpadPrice > 0 ? numpadPrice : price;

      const virtualProduct: Product = {
        id: `rack-${code.toLowerCase().replace(/\s+/g, '-')}`,
        name: name,
        category: 'price-codes',
        price: effectivePrice,
        barcode: code,
        code: code,
        icon: '✉️',
      };
      handleAddToCart(virtualProduct, effectivePrice);
    },
    [handleAddToCart, numpadVal]
  );

  // Update unit price of an existing cart item to match detected numpad price
  const handleUpdateItemUnitPrice = useCallback(
    (cartItemId: string, newUnitPrice: number) => {
      if (newUnitPrice <= 0) return;
      setCart((prev) =>
        prev.map((item) =>
          item.cartItemId === cartItemId ? { ...item, price: newUnitPrice } : item
        )
      );
      setNumpadVal('');
    },
    []
  );

  // Copy unit price from cart item back to numpad
  const handleSetNumpadPrice = useCallback((priceNum: number) => {
    if (priceNum <= 0) return;
    const cents = Math.round(priceNum * 100);
    setNumpadVal(cents.toString());
  }, []);

  // Update item quantity
  const handleUpdateQty = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Remove individual item
  const handleRemoveItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  // Toggle item 50% discount
  const handleToggleItemDiscount = (cartItemId: string) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          return {
            ...item,
            discount: item.discount === 50 ? 0 : 50,
          };
        }
        return item;
      })
    );
  };

  // Apply 50% discount to all items currently in cart
  const handleApplyCart50 = () => {
    setCart((prev) =>
      prev.map((item) => ({
        ...item,
        discount: 50,
      }))
    );
  };

  // Clear Cart
  const handleClearCart = () => {
    setCart([]);
    setNumpadVal('');
  };

  // Numpad key press with automatic decimal point insertion ($0.00 base)
  const handlePressNum = (digit: string) => {
    if (digit === '.') {
      // If user taps dot, shift to whole dollars (e.g. 2 -> 2.00)
      setNumpadVal((prev) => {
        const clean = prev.replace(/\D/g, '').replace(/^0+/, '');
        if (!clean) return '';
        return clean + '00';
      });
      return;
    }
    if (digit === '00') {
      setNumpadVal((prev) => {
        const clean = prev.replace(/\D/g, '').replace(/^0+/, '');
        if (!clean) return '';
        return clean + '00';
      });
      return;
    }
    // Single digit (0-9): auto-shifts from right with decimal point at 2 places
    setNumpadVal((prev) => {
      const clean = prev.replace(/\D/g, '').replace(/^0+/, '');
      if (clean.length >= 7) return prev;
      return clean + digit;
    });
  };

  // Open $ custom item modal (or instant add if numpad price is already typed)
  const handleOpenPriceItem = () => {
    const clean = numpadVal.replace(/\D/g, '').replace(/^0+/, '');
    const numPrice = clean ? parseInt(clean, 10) / 100 : null;
    if (numPrice && numPrice > 0) {
      handleAddCustomItem({
        name: is50Active ? 'Greeting Card / Item (50% Off)' : 'Greeting Card / Open Item',
        price: numPrice,
        discount: is50Active ? 50 : 0,
        category: 'price-codes',
      });
    } else {
      setIsOpenPriceModalOpen(true);
    }
  };

  // Add custom item from modal
  const handleAddCustomItem = (custom: {
    name: string;
    price: number;
    discount: number;
    category: string;
  }) => {
    const newItem: CartItem = {
      id: `custom-${Date.now()}`,
      cartItemId: `custom-item-${Date.now()}`,
      name: custom.name,
      price: custom.price,
      category: custom.category,
      barcode: 'OPEN-PRICE',
      code: 'Custom',
      icon: '✨',
      qty: 1,
      discount: custom.discount,
    };
    setCart((prev) => [...prev, newItem]);
    setNumpadVal('');
  };

  // Calculate order totals
  let subtotal = 0;
  let discountTotal = 0;
  cart.forEach((item) => {
    const lineGross = item.price * item.qty;
    const lineDiscount = lineGross * (item.discount / 100);
    subtotal += lineGross;
    discountTotal += lineDiscount;
  });
  const taxableAmount = Math.max(0, subtotal - discountTotal);
  const taxAmount = taxableAmount * receiptSettings.taxRate;
  const totalDue = taxableAmount + taxAmount;

  // Checkout trigger
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Cart is empty! Add cards or gifts before checkout.');
      return;
    }
    setIsPaymentModalOpen(true);
  };

  // Finalize Sale
  const handleCompleteSale = (paymentDetails: {
    method: 'cash' | 'card' | 'split' | 'giftcard';
    tenderedAmount: number;
    changeDue: number;
  }) => {
    const orderNumber = `${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      timestamp: Date.now(),
      items: [...cart],
      subtotal,
      discountTotal,
      taxRate: receiptSettings.taxRate,
      taxAmount,
      total: totalDue,
      paymentMethod: paymentDetails.method,
      tenderedAmount: paymentDetails.tenderedAmount,
      changeDue: paymentDetails.changeDue,
      cashierName: activeCashier,
      status: 'completed',
    };

    setOrders((prev) => [newOrder, ...prev]);
    setActiveReceiptOrder(newOrder);
    setIsPaymentModalOpen(false);
    setIsReceiptModalOpen(true);
    setCart([]);
    setNumpadVal('');

    // Kick drawer if cash sale
    if (paymentDetails.method === 'cash' && printerSettings.cashDrawerKickOnSale) {
      triggerCashDrawerKick(printerSettings.selectedPrinter);
    }

    // Auto print receipt if enabled
    if (printerSettings.autoPrintOnSale) {
      setTimeout(() => {
        printReceiptDocument(printerSettings.selectedPrinter, true);
      }, 300);
    }
  };

  // Process Refund (Guaranteed state & log update)
  const handleProcessRefund = (
    orderId: string,
    refundDetails: {
      reason: string;
      method: 'cash' | 'card' | 'storecredit';
      refundedBy: string;
    }
  ) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'refunded',
              refundTimestamp: Date.now(),
              refundReason: refundDetails.reason,
              refundedBy: refundDetails.refundedBy,
              refundMethod: refundDetails.method,
            }
          : o
      )
    );
  };

  // Create Z-Report
  const handleCreateZReport = (zReport: ZReport) => {
    setZReports((prev) => [zReport, ...prev]);
    setOrders((prev) =>
      prev.map((o) => (!o.zReportId ? { ...o, zReportId: zReport.id } : o))
    );
  };

  // Software Format Handlers for New User / Store Reset
  const handleFullSoftwareFormat = () => {
    // Wipe everything
    setProducts([]);
    setOrders([]);
    setZReports([]);
    setCart([]);
    setNumpadVal('');
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.Z_REPORTS);
    alert('Software format complete! Clean state created for new store user.');
  };

  const handleFormatInventoryOnly = () => {
    setProducts([]);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    alert('Inventory catalog formatted and cleared.');
  };

  const handleFormatSalesOnly = () => {
    setOrders([]);
    setZReports([]);
    setCart([]);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.Z_REPORTS);
    alert('All sales records and Z-reports cleared for Day 1 opening.');
  };

  // Inventory Management
  const handleAddProduct = (newProd: Product) => {
    setProducts((prev) => [newProd, ...prev]);
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleImportProducts = (newItems: Product[], replace: boolean) => {
    if (replace) {
      setProducts(newItems);
    } else {
      setProducts((prev) => [...newItems, ...prev]);
    }
  };

  const handleClearAllProducts = () => {
    setProducts([]);
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === 'F2') {
        e.preventDefault();
        playToggleChime(!is50Active);
        handleToggle50Discount();
      } else if (e.key === 'F3') {
        e.preventDefault();
        setIsRefundModalOpen(true);
      } else if (e.key === 'F4') {
        e.preventDefault();
        handleClearCart();
      } else if (e.key === 'F5') {
        e.preventDefault();
        handleOpenCashDrawer();
      } else if (e.key === 'F8') {
        e.preventDefault();
        handleOpenPriceItem();
      } else if (e.key === 'F9') {
        e.preventDefault();
        setIsReportsModalOpen(true);
      } else if (e.key === 'F12' || (e.key === 'Enter' && cart.length > 0)) {
        e.preventDefault();
        handleCheckout();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [is50Active, cart.length, handleToggle50Discount, handleOpenCashDrawer]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#1e1e2d] text-white font-sans overflow-hidden select-none">
      {/* Top POS System Navbar */}
      <header className="h-14 bg-[#181824] border-b border-[#3f3f5a] px-4 flex items-center justify-between shrink-0 z-20">
        {/* Brand & Store Status */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00d2d3] to-[#10ac84] flex items-center justify-center text-gray-900 shadow-lg">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-white text-sm tracking-wide">
                {storeProfile.storeName || receiptSettings.storeName || 'Greeting Cards POS'}
              </h1>
              <span className="text-[10px] font-bold bg-[#10ac84]/20 text-[#10ac84] border border-[#10ac84]/40 px-2 py-0.5 rounded-full">
                ONLINE
              </span>
            </div>
            <p className="text-[10px] text-gray-400">
              {storeProfile.tagline || 'Retail Point of Sale System'}
            </p>
          </div>
        </div>

        {/* Center Indicators */}
        <div className="hidden md:flex items-center gap-3 text-xs">
          {/* Active Cashier Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#252538] border border-[#3f3f5a] rounded-lg text-gray-300">
            <User className="w-3.5 h-3.5 text-[#00d2d3]" />
            <select
              value={activeCashier}
              onChange={(e) => setActiveCashier(e.target.value)}
              className="bg-transparent font-medium text-white focus:outline-none cursor-pointer"
            >
              {cashiers.map((c) => (
                <option key={c.id} value={c.name} className="bg-[#252538] text-white">
                  {c.name} ({c.role})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#252538] border border-[#3f3f5a] rounded-lg text-gray-300">
            <Clock className="w-3.5 h-3.5 text-[#ff9f43]" />
            <span className="font-mono">{currentTime}</span>
          </div>

          {/* 50% Switch Global Quick Indicator */}
          <div
            onClick={handleToggle50Discount}
            className={`cursor-pointer px-3 py-1 rounded-lg border text-xs font-black transition-all flex items-center gap-1.5 ${
              is50Active
                ? 'bg-[#ee5253] text-white border-red-400 shadow-md shadow-red-500/20 animate-pulse'
                : 'bg-[#252538] text-gray-400 border-[#3f3f5a] hover:text-white'
            }`}
            title="Press F2 to toggle 50% discount"
          >
            <span>50% OFF:</span>
            <span>{is50Active ? 'ACTIVE (F2)' : 'OFF (F2)'}</span>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-1.5">
          {/* Open Cash Drawer Button */}
          <button
            onClick={handleOpenCashDrawer}
            className="px-3 py-1.5 bg-[#252538] hover:bg-[#32324d] text-[#10ac84] border border-[#10ac84]/50 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            title="Open physical cash drawer (F5)"
          >
            <Unlock className="w-4 h-4" />
            <span className="hidden sm:inline">Open Drawer</span>
          </button>

          {/* Return & Refund */}
          <button
            onClick={() => setIsRefundModalOpen(true)}
            className="px-3 py-1.5 bg-[#252538] hover:bg-[#32324d] text-[#ee5253] border border-[#ee5253]/50 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            title="Process Return & Refund (F3)"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Refund</span>
          </button>

          {/* Connected Windows Printer Setup */}
          <button
            onClick={() => setIsPrinterModalOpen(true)}
            className="px-3 py-1.5 bg-[#252538] hover:bg-[#32324d] text-[#00d2d3] border border-[#3f3f5a] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Select & Auto-Connect Receipt Printer"
          >
            <Printer className="w-4 h-4 text-[#00d2d3]" />
            <span className="hidden sm:inline">Printer</span>
          </button>

          {/* Windows EXE Builder guide */}
          <button
            onClick={() => setIsWindowsExeModalOpen(true)}
            className="px-3 py-1.5 bg-[#252538] hover:bg-[#32324d] text-gray-200 border border-[#3f3f5a] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Windows Standalone EXE package"
          >
            <Monitor className="w-4 h-4 text-[#3b82f6]" />
            <span className="hidden sm:inline">Windows .EXE</span>
          </button>

          {/* Inventory */}
          <button
            onClick={() => setIsInventoryModalOpen(true)}
            className="px-3 py-1.5 bg-[#252538] hover:bg-[#32324d] text-gray-200 border border-[#3f3f5a] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Manage Products & Import CSV"
          >
            <Package className="w-4 h-4 text-[#ec4899]" />
            <span className="hidden sm:inline">Inventory ({products.length})</span>
          </button>

          {/* Shift & Z-Report */}
          <button
            onClick={() => setIsReportsModalOpen(true)}
            className="px-3 py-1.5 bg-[#252538] hover:bg-[#32324d] text-gray-200 border border-[#3f3f5a] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Shift Sales, X-Report & Z-Report Closeout (F9)"
          >
            <FileText className="w-4 h-4 text-[#10ac84]" />
            <span className="hidden sm:inline">Shift / Z-Report</span>
          </button>

          {/* Settings & Profiles */}
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="px-3 py-1.5 bg-[#252538] hover:bg-[#32324d] text-[#8b5cf6] border border-[#8b5cf6]/50 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Store Profiles, Staff & Software Format"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-lg border text-xs transition-colors ${
              soundOn
                ? 'bg-[#252538] hover:bg-[#32324d] text-[#10ac84] border-[#3f3f5a]'
                : 'bg-[#252538] hover:bg-[#32324d] text-gray-400 border-[#3f3f5a]'
            }`}
            title={soundOn ? 'Sound FX Enabled' : 'Sound FX Muted'}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Help Popover */}
          <button
            onClick={() => setIsHelpOpen(!isHelpOpen)}
            className="p-2 bg-[#252538] hover:bg-[#32324d] text-gray-300 border border-[#3f3f5a] rounded-lg text-xs transition-colors"
            title="Shortcuts & POS Help"
          >
            <HelpCircle className="w-4 h-4 text-[#ff9f43]" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-[#252538] hover:bg-[#32324d] text-gray-300 border border-[#3f3f5a] rounded-lg text-xs transition-colors"
            title="Toggle Kiosk Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Cash Drawer Opened Toast Notification */}
      {drawerAlert && (
        <div className="bg-[#10ac84] text-gray-950 font-black text-xs py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-2 animate-in slide-in-from-top duration-150">
          <Unlock className="w-4 h-4" />
          <span>{drawerAlert}</span>
        </div>
      )}

      {/* Main POS Interface (Catalog on LEFT, Keypad & Cart on RIGHT) */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Side: Product Catalog Grid, Rack Price Codes, Barcode Search */}
        <LeftPanelCatalog
          products={products}
          is50Active={is50Active}
          numpadVal={numpadVal}
          onClearNumpad={() => setNumpadVal('')}
          onAddToCart={handleAddToCart}
          onQuickPriceTier={handleQuickPriceTier}
        />

        {/* Right Side: Keypad, Cart, 50% Switch, Cash Drawer Open & Summary */}
        <RightPanelCart
          cart={cart}
          is50Active={is50Active}
          numpadVal={numpadVal}
          taxRate={receiptSettings.taxRate}
          cashierName={activeCashier}
          onToggle50Discount={handleToggle50Discount}
          onPressNum={handlePressNum}
          onClearNumpad={() => setNumpadVal('')}
          onClearCart={handleClearCart}
          onApplyCart50={handleApplyCart50}
          onOpenPriceItem={handleOpenPriceItem}
          onCheckout={handleCheckout}
          onUpdateQty={handleUpdateQty}
          onRemoveItem={handleRemoveItem}
          onToggleItemDiscount={handleToggleItemDiscount}
          onSetItemDiscountPercent={(itemId, pct) => {
            setCart((prev) =>
              prev.map((i) => (i.cartItemId === itemId ? { ...i, discount: pct } : i))
            );
          }}
          onOpenCashDrawer={handleOpenCashDrawer}
          onUpdateItemUnitPrice={handleUpdateItemUnitPrice}
          onSetNumpadPrice={handleSetNumpadPrice}
        />
      </main>

      {/* Modals */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        total={totalDue}
        onClose={() => setIsPaymentModalOpen(false)}
        onCompleteSale={handleCompleteSale}
      />

      <ReceiptModal
        order={activeReceiptOrder}
        settings={receiptSettings}
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
      />

      <CustomizeReceiptModal
        isOpen={isCustomizeReceiptOpen}
        settings={receiptSettings}
        onClose={() => setIsCustomizeReceiptOpen(false)}
        onSave={(newSettings) => setReceiptSettings(newSettings)}
      />

      <PrinterModal
        isOpen={isPrinterModalOpen}
        settings={printerSettings}
        onClose={() => setIsPrinterModalOpen(false)}
        onSaveSettings={(newSettings) => setPrinterSettings(newSettings)}
        onKickDrawer={handleOpenCashDrawer}
      />

      <RefundModal
        isOpen={isRefundModalOpen}
        orders={orders}
        cashierName={activeCashier}
        settings={receiptSettings}
        onClose={() => setIsRefundModalOpen(false)}
        onProcessRefund={handleProcessRefund}
        onKickDrawer={handleOpenCashDrawer}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        storeProfile={storeProfile}
        cashiers={cashiers}
        activeCashier={activeCashier}
        receiptSettings={receiptSettings}
        productCount={products.length}
        orderCount={orders.length}
        zReportCount={zReports.length}
        onClose={() => setIsSettingsModalOpen(false)}
        onUpdateStoreProfile={(p) => setStoreProfile(p)}
        onUpdateCashiers={(c) => setCashiers(c)}
        onSetActiveCashier={(name) => setActiveCashier(name)}
        onUpdateReceiptSettings={(s) => setReceiptSettings(s)}
        onFullSoftwareFormat={handleFullSoftwareFormat}
        onFormatInventoryOnly={handleFormatInventoryOnly}
        onFormatSalesOnly={handleFormatSalesOnly}
      />

      <WindowsExeModal
        isOpen={isWindowsExeModalOpen}
        onClose={() => setIsWindowsExeModalOpen(false)}
      />

      <OpenPriceModal
        isOpen={isOpenPriceModalOpen}
        initialPrice={(() => {
          if (!numpadVal) return '';
          const clean = numpadVal.replace(/\D/g, '').replace(/^0+/, '');
          if (!clean) return '';
          return (parseInt(clean, 10) / 100).toFixed(2);
        })()}
        is50Active={is50Active}
        onClose={() => setIsOpenPriceModalOpen(false)}
        onAdd={handleAddCustomItem}
      />

      <ReportsModal
        isOpen={isReportsModalOpen}
        orders={orders}
        zReports={zReports}
        cashierName={activeCashier}
        settings={receiptSettings}
        onClose={() => setIsReportsModalOpen(false)}
        onReprintReceipt={(ord) => {
          setActiveReceiptOrder(ord);
          setIsReceiptModalOpen(true);
        }}
        onRefundOrder={(orderId) =>
          handleProcessRefund(orderId, {
            reason: 'Manager Refund',
            method: 'cash',
            refundedBy: activeCashier,
          })
        }
        onCreateZReport={handleCreateZReport}
      />

      <InventoryModal
        isOpen={isInventoryModalOpen}
        products={products}
        onClose={() => setIsInventoryModalOpen(false)}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onImportProducts={handleImportProducts}
        onClearAllProducts={handleClearAllProducts}
      />

      {/* Quick Help Popover */}
      {isHelpOpen && (
        <div className="fixed bottom-4 right-4 z-40 bg-[#252538] border border-[#3f3f5a] rounded-xl p-4 shadow-2xl max-w-sm text-xs space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between font-bold text-[#ff9f43]">
            <span>Cashier Quick Shortcuts</span>
            <button
              onClick={() => setIsHelpOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1.5 text-gray-300">
            <div className="flex justify-between">
              <span className="font-mono text-gray-400">F2</span>
              <span>Toggle 50% OFF Switch</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-gray-400">F3</span>
              <span>Refund / Returns Processing</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-gray-400">F4</span>
              <span>Void / Clear Cart</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-gray-400">F5</span>
              <span>Open Cash Drawer (No Sale)</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-gray-400">F8</span>
              <span>Open $ Custom Item</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-gray-400">F9</span>
              <span>Shift Sales &amp; Z-Report</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-gray-400">F12 / Enter</span>
              <span>Pay Cash / Checkout</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
