import React, { useState } from 'react';
import {
  FileText,
  X,
  Printer,
  Receipt,
  DollarSign,
  CreditCard,
  ShoppingBag,
  TrendingUp,
  Lock,
  CheckCircle,
  AlertTriangle,
  History,
  Check,
  Sparkles,
} from 'lucide-react';
import { Order, ZReport, ReceiptSettings } from '../types';
import { playCashRegisterDing } from '../utils/audio';

interface ReportsModalProps {
  isOpen: boolean;
  orders: Order[];
  zReports: ZReport[];
  cashierName: string;
  settings: ReceiptSettings;
  onClose: () => void;
  onReprintReceipt: (order: Order) => void;
  onRefundOrder: (orderId: string) => void;
  onCreateZReport: (zReport: ZReport) => void;
}

export const ReportsModal: React.FC<ReportsModalProps> = ({
  isOpen,
  orders,
  zReports,
  cashierName,
  settings,
  onClose,
  onReprintReceipt,
  onRefundOrder,
  onCreateZReport,
}) => {
  const [activeTab, setActiveTab] = useState<'xreport' | 'zreport' | 'zhistory' | 'transactions'>('xreport');
  const [searchReceipt, setSearchReceipt] = useState('');

  // Z-Report Closeout Form State
  const [startingFloat, setStartingFloat] = useState<string>('100.00'); // Standard opening register float
  const [countedCash, setCountedCash] = useState<string>('');
  const [showZConfirm, setShowZConfirm] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [selectedHistoricalZ, setSelectedHistoricalZ] = useState<ZReport | null>(null);
  const [orderToRefund, setOrderToRefund] = useState<Order | null>(null);

  if (!isOpen) return null;

  // Active unclosed completed orders for current shift
  const currentShiftOrders = orders.filter((o) => !o.zReportId && o.status === 'completed');
  const currentShiftRefunds = orders.filter((o) => !o.zReportId && o.status === 'refunded');

  const grossSales = currentShiftOrders.reduce((sum, o) => sum + o.subtotal, 0);
  const discountsTotal = currentShiftOrders.reduce((sum, o) => sum + o.discountTotal, 0);
  const taxTotal = currentShiftOrders.reduce((sum, o) => sum + o.taxAmount, 0);
  const netTotal = currentShiftOrders.reduce((sum, o) => sum + o.total, 0);

  const cashOrders = currentShiftOrders.filter((o) => o.paymentMethod === 'cash');
  const cardOrders = currentShiftOrders.filter((o) => o.paymentMethod === 'card');
  const gcOrders = currentShiftOrders.filter((o) => o.paymentMethod === 'giftcard');

  const cashSales = cashOrders.reduce((sum, o) => sum + o.total, 0);
  const cardSales = cardOrders.reduce((sum, o) => sum + o.total, 0);
  const giftCardSales = gcOrders.reduce((sum, o) => sum + o.total, 0);

  const refundTotal = currentShiftRefunds.reduce((sum, o) => sum + o.total, 0);
  const avgTicket = currentShiftOrders.length > 0 ? netTotal / currentShiftOrders.length : 0;

  // Drawer reconciliation
  const floatNum = parseFloat(startingFloat) || 0;
  const expectedCashInDrawer = floatNum + cashSales - refundTotal;
  const countedCashNum = countedCash !== '' ? parseFloat(countedCash) || 0 : expectedCashInDrawer;
  const overShort = countedCash !== '' ? countedCashNum - expectedCashInDrawer : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleAutoFillExpected = () => {
    setCountedCash(expectedCashInDrawer.toFixed(2));
  };

  const handleTriggerFinalize = () => {
    if (countedCash === '') {
      setCountedCash(expectedCashInDrawer.toFixed(2));
    }
    setShowZConfirm(true);
  };

  const executeCloseout = () => {
    setShowZConfirm(false);
    const finalCounted = countedCash !== '' ? parseFloat(countedCash) || 0 : expectedCashInDrawer;
    const finalOverShort = finalCounted - expectedCashInDrawer;

    const nextZNum = `Z-${String(zReports.length + 1).padStart(4, '0')}`;
    const zReport: ZReport = {
      id: `z-${Date.now()}`,
      zNumber: nextZNum,
      closedAt: Date.now(),
      closedBy: cashierName,
      startingFloat: floatNum,
      cashSales,
      cardSales,
      giftCardSales,
      grossSales,
      discountsTotal,
      taxTotal,
      netTotal,
      expectedCashInDrawer,
      actualCashCounted: finalCounted,
      overShortDifference: finalOverShort,
      transactionCount: currentShiftOrders.length,
      refundCount: currentShiftRefunds.length,
      refundTotal,
    };

    playCashRegisterDing();
    onCreateZReport(zReport);
    setSelectedHistoricalZ(zReport);
    setSuccessBanner(`Official Closeout ${nextZNum} finalized! Register has been closed and zeroed.`);
    setActiveTab('zhistory');

    // Auto-clear success banner after 6 seconds
    setTimeout(() => {
      setSuccessBanner(null);
    }, 6000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#252538] border border-[#3f3f5a] rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1b1b28] border-b border-[#3f3f5a]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-[#00d2d3] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Store Reports &amp; Register Closeout</h3>
              <p className="text-xs text-gray-400">X-Reading, Daily Z-Report &amp; Past Sales History</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-[#2b2b40] p-1 rounded-lg border border-[#3f3f5a] gap-1">
              <button
                onClick={() => setActiveTab('xreport')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                  activeTab === 'xreport'
                    ? 'bg-[#00d2d3] text-gray-900 shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                X-Report (Shift)
              </button>
              <button
                onClick={() => setActiveTab('zreport')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${
                  activeTab === 'zreport'
                    ? 'bg-[#ff9f43] text-gray-900 shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Lock className="w-3 h-3" />
                <span>Z-Report (Closeout)</span>
              </button>
              <button
                onClick={() => setActiveTab('zhistory')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${
                  activeTab === 'zhistory'
                    ? 'bg-[#10ac84] text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <History className="w-3 h-3" />
                <span>Z-Archive ({zReports.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                  activeTab === 'transactions'
                    ? 'bg-[#00d2d3] text-gray-900 shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Orders ({orders.length})
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-[#32324d] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Success Banner */}
        {successBanner && (
          <div className="bg-emerald-950/80 border-b border-emerald-500 p-3 px-6 text-emerald-300 text-xs font-bold flex items-center justify-between animate-in slide-in-from-top">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{successBanner}</span>
            </div>
            <button
              onClick={() => setSuccessBanner(null)}
              className="text-emerald-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: X-REPORT (Current mid-shift reading) */}
          {activeTab === 'xreport' && (
            <div className="space-y-6">
              {/* Metrics summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#1e1e2d] border border-[#3f3f5a] p-3.5 rounded-xl">
                  <div className="flex items-center justify-between text-gray-400 text-xs mb-1 font-medium">
                    <span>Shift Net Sales</span>
                    <TrendingUp className="w-4 h-4 text-[#10ac84]" />
                  </div>
                  <div className="text-2xl font-bold text-[#10ac84]">${netTotal.toFixed(2)}</div>
                  <div className="text-[11px] text-gray-500 mt-1">Tax included</div>
                </div>

                <div className="bg-[#1e1e2d] border border-[#3f3f5a] p-3.5 rounded-xl">
                  <div className="flex items-center justify-between text-gray-400 text-xs mb-1 font-medium">
                    <span>Active Orders</span>
                    <ShoppingBag className="w-4 h-4 text-[#00d2d3]" />
                  </div>
                  <div className="text-2xl font-bold text-white">{currentShiftOrders.length}</div>
                  <div className="text-[11px] text-gray-500 mt-1">Avg: ${avgTicket.toFixed(2)}</div>
                </div>

                <div className="bg-[#1e1e2d] border border-[#3f3f5a] p-3.5 rounded-xl">
                  <div className="flex items-center justify-between text-gray-400 text-xs mb-1 font-medium">
                    <span>Cash Sales</span>
                    <DollarSign className="w-4 h-4 text-[#ff9f43]" />
                  </div>
                  <div className="text-2xl font-bold text-[#ff9f43]">${cashSales.toFixed(2)}</div>
                  <div className="text-[11px] text-gray-500 mt-1">{cashOrders.length} transactions</div>
                </div>

                <div className="bg-[#1e1e2d] border border-[#3f3f5a] p-3.5 rounded-xl">
                  <div className="flex items-center justify-between text-gray-400 text-xs mb-1 font-medium">
                    <span>Discounts Given</span>
                    <span className="text-xs text-[#ee5253] font-bold">PROMOS</span>
                  </div>
                  <div className="text-2xl font-bold text-[#ee5253]">-${discountsTotal.toFixed(2)}</div>
                  <div className="text-[11px] text-gray-500 mt-1">Customer savings</div>
                </div>
              </div>

              {/* Payment media breakdown */}
              <div className="bg-[#1e1e2d] border border-[#3f3f5a] rounded-xl p-5 space-y-3">
                <h4 className="font-bold text-xs text-gray-300 uppercase tracking-wider">
                  Payment Media Breakdown
                </h4>
                <div className="divide-y divide-[#3f3f5a]/60 text-sm">
                  <div className="flex justify-between py-2">
                    <span className="flex items-center gap-2 text-gray-300">
                      <DollarSign className="w-4 h-4 text-[#10ac84]" />
                      Cash Sales:
                    </span>
                    <span className="font-bold text-white">${cashSales.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="flex items-center gap-2 text-gray-300">
                      <CreditCard className="w-4 h-4 text-[#3b82f6]" />
                      Card Sales (Chip/Contactless):
                    </span>
                    <span className="font-bold text-white">${cardSales.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="flex items-center gap-2 text-gray-300">
                      <Receipt className="w-4 h-4 text-[#ec4899]" />
                      Gift Card Redemptions:
                    </span>
                    <span className="font-bold text-white">${giftCardSales.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-400">Total Tax Collected ({(settings.taxRate * 100).toFixed(1)}%):</span>
                    <span className="font-bold text-white">${taxTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-400">Total Gross Merchandise:</span>
                    <span className="font-bold text-white">${grossSales.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('zreport')}
                  className="px-4 py-2.5 bg-[#ff9f43]/20 hover:bg-[#ff9f43]/30 text-[#ff9f43] border border-[#ff9f43]/40 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Lock className="w-4 h-4" />
                  <span>Ready to Close Register? Run Z-Report</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-5 py-2.5 bg-[#00d2d3] hover:bg-[#00b4b5] text-gray-900 font-bold rounded-lg text-sm flex items-center gap-2 transition-colors shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Shift X-Report</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Z-REPORT (End of Day Closeout) */}
          {activeTab === 'zreport' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-950/40 to-[#252538] border border-amber-500/40 p-4 rounded-xl flex items-start gap-3">
                <Lock className="w-5 h-5 text-[#ff9f43] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-[#ff9f43]">Daily Z-Report Closeout Procedure</h4>
                  <p className="text-xs text-gray-300 mt-0.5">
                    Count physical cash in the drawer, enter the amount below, and finalize. This will print the official closeout ticket, archive the shift, and reset the sales register to zero for the next day.
                  </p>
                </div>
              </div>

              {/* Drawer Cash Count Form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#1e1e2d] border border-[#3f3f5a] p-4 rounded-xl">
                  <label className="text-xs font-semibold text-gray-400 block mb-1">
                    1. Opening Float ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={startingFloat}
                      onChange={(e) => setStartingFloat(e.target.value)}
                      className="w-full bg-[#252538] border border-[#3f3f5a] rounded-lg pl-7 pr-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-[#ff9f43]"
                      placeholder="100.00"
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 block mt-1">Starting cash float in till</span>
                </div>

                <div className="bg-[#1e1e2d] border border-[#3f3f5a] p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-gray-400">
                      2. Expected Cash in Drawer
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoFillExpected}
                      className="text-[10px] text-[#00d2d3] hover:underline font-bold"
                    >
                      Use Expected
                    </button>
                  </div>
                  <div className="text-2xl font-mono font-bold text-white pt-1">
                    ${expectedCashInDrawer.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-gray-500 block mt-1">
                    Float (${floatNum.toFixed(2)}) + Cash Sales (${cashSales.toFixed(2)})
                  </span>
                </div>

                <div className="bg-[#1e1e2d] border border-[#3f3f5a] p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#00d2d3]">
                      3. Actual Cash Counted ($) *
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoFillExpected}
                      className="px-2 py-0.5 bg-[#00d2d3]/20 hover:bg-[#00d2d3]/30 text-[#00d2d3] rounded text-[10px] font-bold transition-colors"
                    >
                      Match Expected
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00d2d3] font-bold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      autoFocus
                      value={countedCash}
                      onChange={(e) => setCountedCash(e.target.value)}
                      className="w-full bg-[#252538] border border-[#00d2d3] rounded-lg pl-7 pr-3 py-2 text-white font-mono font-bold text-lg focus:outline-none"
                      placeholder={expectedCashInDrawer.toFixed(2)}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 block mt-1">Physical bills and coins count</span>
                </div>
              </div>

              {/* Over / Short Discrepancy Callout */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  Math.abs(overShort) < 0.01
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : overShort > 0
                    ? 'bg-blue-950/40 border-blue-500/40 text-blue-300'
                    : 'bg-red-950/40 border-red-500/40 text-red-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {Math.abs(overShort) < 0.01 ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  )}
                  <div>
                    <span className="font-bold text-sm block">
                      Drawer Discrepancy (Over / Short):
                    </span>
                    <span className="text-xs">
                      {Math.abs(overShort) < 0.01
                        ? 'Drawer is perfectly balanced!'
                        : overShort > 0
                        ? `Cash drawer is OVER by +$${overShort.toFixed(2)}`
                        : `Cash drawer is SHORT by -$${Math.abs(overShort).toFixed(2)}`}
                    </span>
                  </div>
                </div>
                <div className="text-2xl font-mono font-black">
                  {overShort >= 0 ? `+$${overShort.toFixed(2)}` : `-$${Math.abs(overShort).toFixed(2)}`}
                </div>
              </div>

              {/* Summary table */}
              <div className="bg-[#1e1e2d] border border-[#3f3f5a] rounded-xl p-5 space-y-2 text-sm">
                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Shift Orders to be Closed
                </h5>
                <div className="flex justify-between py-1 border-b border-[#3f3f5a]/40 text-gray-300">
                  <span>Gross Sales:</span>
                  <span className="font-mono text-white">${grossSales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#3f3f5a]/40 text-gray-300">
                  <span>Promotional Discounts:</span>
                  <span className="font-mono text-[#ee5253]">-${discountsTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#3f3f5a]/40 text-gray-300">
                  <span>Sales Tax:</span>
                  <span className="font-mono text-white">${taxTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#3f3f5a]/40 text-gray-300">
                  <span>Net Sales Total:</span>
                  <span className="font-mono font-bold text-[#10ac84]">${netTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 text-gray-300">
                  <span>Completed Orders in this Shift:</span>
                  <span className="font-bold text-white">{currentShiftOrders.length} orders</span>
                </div>
              </div>

              {/* Inline Confirmation Prompt (replaces browser confirm dialog) */}
              {showZConfirm ? (
                <div className="p-4 bg-amber-950/60 border border-amber-500 rounded-xl space-y-3 animate-in zoom-in-95">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <span>Confirm Register Closeout?</span>
                  </div>
                  <p className="text-xs text-gray-200">
                    Are you ready to finalize this shift? This will record <strong>${netTotal.toFixed(2)}</strong> in sales, archive <strong>{currentShiftOrders.length}</strong> active order(s), and zero the daily sales register.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowZConfirm(false)}
                      className="px-4 py-2 bg-[#32324d] hover:bg-[#3f3f5a] text-white rounded-lg text-xs font-semibold"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={executeCloseout}
                      className="flex-1 py-2 bg-[#ff9f43] hover:bg-[#f39c12] text-gray-950 font-black rounded-lg text-xs shadow-lg flex items-center justify-center gap-1.5"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Confirm &amp; Finalize Z-Report</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('xreport')}
                    className="px-5 py-3 bg-[#32324d] hover:bg-[#3f3f5a] text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleTriggerFinalize}
                    className="flex-1 py-3.5 bg-[#ff9f43] hover:bg-[#f39c12] text-gray-950 font-black rounded-xl text-base flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer"
                  >
                    <Lock className="w-5 h-5" />
                    <span>Finalize &amp; Print Official Z-Report Closeout</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Z-REPORT ARCHIVE (Past daily closeouts) */}
          {activeTab === 'zhistory' && (
            <div className="space-y-4">
              {zReports.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Lock className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="font-bold text-sm">No Z-Reports Recorded Yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    When you close out the register in the "Z-Report" tab, your daily closeout tickets will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* List of past Z-reports */}
                  <div className="md:col-span-5 space-y-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      Historical Z-Reports ({zReports.length})
                    </span>
                    {zReports.map((z) => (
                      <div
                        key={z.id}
                        onClick={() => setSelectedHistoricalZ(z)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          selectedHistoricalZ?.id === z.id
                            ? 'bg-[#32324d] border-[#00d2d3]'
                            : 'bg-[#1e1e2d] border-[#3f3f5a] hover:bg-[#252538]'
                        }`}
                      >
                        <div className="flex justify-between items-center font-mono font-bold text-white text-sm">
                          <span>{z.zNumber}</span>
                          <span className="text-[#10ac84]">${z.netTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>{new Date(z.closedAt).toLocaleDateString()}</span>
                          <span>{z.transactionCount} orders</span>
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          Closed by {z.closedBy}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Selected Z-Report Ticket View */}
                  <div className="md:col-span-7 flex flex-col items-center">
                    {selectedHistoricalZ ? (
                      <div className="w-full space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-400 uppercase">
                            Formal Z-Report Ticket
                          </span>
                          <button
                            onClick={handlePrint}
                            className="px-3 py-1.5 bg-[#00d2d3] hover:bg-[#00b4b5] text-gray-900 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print Z-Report</span>
                          </button>
                        </div>

                        {/* Thermal Z-Report Paper */}
                        <div className="bg-white text-gray-900 font-mono text-[11px] p-5 shadow-2xl rounded-sm border border-gray-300 w-full select-text">
                          <div className="text-center pb-2.5 border-b border-dashed border-gray-400">
                            <h4 className="font-bold text-xs uppercase tracking-wider">
                              *** OFFICIAL Z-REPORT CLOSEOUT ***
                            </h4>
                            <p className="text-[10px] font-bold text-gray-800">{settings.storeName}</p>
                            <p className="text-[9px] text-gray-500">{settings.address}</p>
                            <p className="text-[9px] text-gray-500">{settings.phone}</p>
                          </div>

                          <div className="py-2 text-[10px] space-y-0.5 border-b border-dashed border-gray-300">
                            <div className="flex justify-between">
                              <span>Report Number:</span>
                              <strong>{selectedHistoricalZ.zNumber}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Closeout Date:</span>
                              <span>{new Date(selectedHistoricalZ.closedAt).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Cashier / Supervisor:</span>
                              <span>{selectedHistoricalZ.closedBy}</span>
                            </div>
                          </div>

                          <div className="py-2 text-[10px] space-y-0.5 border-b border-dashed border-gray-300">
                            <div className="flex justify-between">
                              <span>Gross Merchandise:</span>
                              <span>${selectedHistoricalZ.grossSales.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-red-600">
                              <span>Total Discounts:</span>
                              <span>-${selectedHistoricalZ.discountsTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Sales Tax Collected:</span>
                              <span>${selectedHistoricalZ.taxTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-xs pt-1 border-t border-gray-800">
                              <span>NET REGISTER SALES:</span>
                              <span>${selectedHistoricalZ.netTotal.toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="py-2 text-[10px] space-y-0.5 border-b border-dashed border-gray-300">
                            <div className="font-bold text-gray-700">PAYMENT MEDIA:</div>
                            <div className="flex justify-between">
                              <span>- Cash Sales:</span>
                              <span>${selectedHistoricalZ.cashSales.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>- Credit / Debit Cards:</span>
                              <span>${selectedHistoricalZ.cardSales.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>- Gift Cards:</span>
                              <span>${selectedHistoricalZ.giftCardSales.toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="py-2 text-[10px] space-y-0.5 border-b border-dashed border-gray-300">
                            <div className="font-bold text-gray-700">DRAWER RECONCILIATION:</div>
                            <div className="flex justify-between">
                              <span>Starting Cash Float:</span>
                              <span>${selectedHistoricalZ.startingFloat.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Expected Drawer Cash:</span>
                              <span>${selectedHistoricalZ.expectedCashInDrawer.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold">
                              <span>Actual Cash Counted:</span>
                              <span>${selectedHistoricalZ.actualCashCounted.toFixed(2)}</span>
                            </div>
                            <div
                              className={`flex justify-between font-bold ${
                                selectedHistoricalZ.overShortDifference < 0
                                  ? 'text-red-600'
                                  : 'text-emerald-700'
                              }`}
                            >
                              <span>OVER / SHORT:</span>
                              <span>
                                {selectedHistoricalZ.overShortDifference >= 0
                                  ? `+$${selectedHistoricalZ.overShortDifference.toFixed(2)}`
                                  : `-$${Math.abs(selectedHistoricalZ.overShortDifference).toFixed(2)}`}
                              </span>
                            </div>
                          </div>

                          <div className="pt-2 text-center text-[9px] text-gray-500">
                            <p>Total Completed Sales: {selectedHistoricalZ.transactionCount}</p>
                            <p className="mt-1 font-bold text-emerald-800">*** REGISTER CLOSED &amp; ZEROED ***</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500 py-12 text-center">
                        Select a Z-Report from the list to view and print.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ORDERS HISTORY */}
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  placeholder="Filter by receipt number..."
                  value={searchReceipt}
                  onChange={(e) => setSearchReceipt(e.target.value)}
                  className="bg-[#1e1e2d] border border-[#3f3f5a] rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00d2d3] w-64"
                />
                <span className="text-xs text-gray-400">
                  Showing {orders.length} transaction(s)
                </span>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Receipt className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p>No transactions found.</p>
                </div>
              ) : (
                <div className="border border-[#3f3f5a] rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#1b1b28] text-gray-400 text-xs uppercase border-b border-[#3f3f5a]">
                      <tr>
                        <th className="p-3">Receipt #</th>
                        <th className="p-3">Time</th>
                        <th className="p-3">Items</th>
                        <th className="p-3">Method</th>
                        <th className="p-3">Total</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3f3f5a]/60">
                      {orders
                        .filter(
                          (o) =>
                            o.orderNumber.toLowerCase().includes(searchReceipt.toLowerCase()) ||
                            o.cashierName.toLowerCase().includes(searchReceipt.toLowerCase())
                        )
                        .map((order) => (
                          <tr
                            key={order.id}
                            className={`hover:bg-[#32324d]/40 transition-colors ${
                              order.status === 'refunded' ? 'opacity-50 line-through' : ''
                            }`}
                          >
                            <td className="p-3 font-mono font-bold text-white">
                              {order.orderNumber}
                              {order.zReportId && (
                                <span className="ml-2 text-[9px] text-amber-400 font-mono px-1 py-0.5 bg-amber-950/80 rounded border border-amber-600/40">
                                  Closed ({order.zReportId.split('-')[1]?.substring(0, 4) || 'Z'})
                                </span>
                              )}
                              {order.status === 'refunded' && (
                                <span className="ml-2 text-[10px] text-red-400 uppercase font-sans font-bold px-1.5 py-0.5 bg-red-950 rounded">
                                  Refunded
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-xs text-gray-400">
                              {new Date(order.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className="p-3 text-xs text-gray-300">
                              {order.items.reduce((s, i) => s + i.qty, 0)} pcs
                            </td>
                            <td className="p-3 text-xs uppercase font-semibold text-gray-300">
                              {order.paymentMethod}
                            </td>
                            <td className="p-3 font-bold text-[#10ac84]">
                              ${order.total.toFixed(2)}
                            </td>
                            <td className="p-3 text-right space-x-1">
                              <button
                                onClick={() => onReprintReceipt(order)}
                                title="Reprint Receipt"
                                className="px-2.5 py-1 bg-[#32324d] hover:bg-[#3f3f5a] text-gray-200 rounded text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Receipt</span>
                              </button>
                              {order.status !== 'refunded' && (
                                <button
                                  onClick={() => setOrderToRefund(order)}
                                  title="Refund order"
                                  className="px-2.5 py-1 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800/60 rounded text-xs font-bold transition-colors cursor-pointer"
                                >
                                  Refund
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Inline Refund Confirmation Modal */}
              {orderToRefund && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
                  <div className="bg-[#252538] border border-red-500 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-3 animate-in zoom-in-95">
                    <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      <span>Confirm Refund for Order #{orderToRefund.orderNumber}?</span>
                    </div>
                    <p className="text-xs text-gray-300">
                      Are you sure you want to refund this sale for <strong>${orderToRefund.total.toFixed(2)}</strong>? This will mark the order as refunded in sales logs and reduce shift net totals.
                    </p>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setOrderToRefund(null)}
                        className="flex-1 py-2 bg-[#32324d] hover:bg-[#3f3f5a] text-white rounded-lg text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onRefundOrder(orderToRefund.id);
                          setSuccessBanner(`Order #${orderToRefund.orderNumber} has been refunded.`);
                          setOrderToRefund(null);
                        }}
                        className="flex-1 py-2 bg-[#ee5253] hover:bg-red-600 text-white font-bold rounded-lg text-xs shadow-lg"
                      >
                        Yes, Refund Order
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
