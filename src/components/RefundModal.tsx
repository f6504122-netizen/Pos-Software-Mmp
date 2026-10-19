import React, { useState } from 'react';
import {
  RotateCcw,
  X,
  Search,
  CheckCircle,
  AlertTriangle,
  Printer,
  DollarSign,
  Receipt,
  Unlock,
} from 'lucide-react';
import { Order, ReceiptSettings } from '../types';
import { playCashRegisterDing } from '../utils/audio';

interface RefundModalProps {
  isOpen: boolean;
  orders: Order[];
  cashierName: string;
  settings: ReceiptSettings;
  onClose: () => void;
  onProcessRefund: (
    orderId: string,
    refundDetails: {
      reason: string;
      method: 'cash' | 'card' | 'storecredit';
      refundedBy: string;
    }
  ) => void;
  onKickDrawer: () => void;
}

export const RefundModal: React.FC<RefundModalProps> = ({
  isOpen,
  orders,
  cashierName,
  settings,
  onClose,
  onProcessRefund,
  onKickDrawer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [refundReason, setRefundReason] = useState('Customer Return (Unused in sleeve)');
  const [refundMethod, setRefundMethod] = useState<'cash' | 'card' | 'storecredit'>('cash');
  const [refundSuccess, setRefundSuccess] = useState<Order | null>(null);
  const [confirmStep, setConfirmStep] = useState(false);

  if (!isOpen) return null;

  // Filter valid completed non-refunded orders
  const refundableOrders = orders.filter((o) => o.status === 'completed');

  const matchingOrders = refundableOrders.filter((o) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.cashierName.toLowerCase().includes(q) ||
      o.items.some((i) => i.name.toLowerCase().includes(q))
    );
  });

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setRefundMethod(order.paymentMethod === 'card' ? 'card' : 'cash');
    setConfirmStep(false);
    setRefundSuccess(null);
  };

  const handleExecuteRefund = () => {
    if (!selectedOrder) return;

    onProcessRefund(selectedOrder.id, {
      reason: refundReason,
      method: refundMethod,
      refundedBy: cashierName,
    });

    if (refundMethod === 'cash') {
      playCashRegisterDing();
      onKickDrawer();
    }

    const updated = {
      ...selectedOrder,
      status: 'refunded' as const,
      refundTimestamp: Date.now(),
      refundReason,
      refundedBy: cashierName,
      refundMethod,
    };

    setRefundSuccess(updated);
    setSelectedOrder(null);
    setConfirmStep(false);
  };

  const handlePrintRefundSlip = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#252538] border border-[#3f3f5a] rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1b1b28] border-b border-[#3f3f5a]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-[#ee5253] flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Returns &amp; Refund Processing</h3>
              <p className="text-xs text-gray-400">Process customer returns, card reversals &amp; cash refunds</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#32324d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Success banner if refund was just completed */}
          {refundSuccess && (
            <div className="bg-emerald-950/60 border border-emerald-500/60 p-4 rounded-xl space-y-2 animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span>Refund Completed for Receipt #{refundSuccess.orderNumber}</span>
                </div>
                <button
                  onClick={handlePrintRefundSlip}
                  className="px-3 py-1 bg-[#00d2d3] hover:bg-[#00b4b5] text-gray-900 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Refund Slip</span>
                </button>
              </div>
              <p className="text-xs text-gray-300">
                Amount of <strong>${refundSuccess.total.toFixed(2)}</strong> has been refunded via{' '}
                <strong className="uppercase">{refundSuccess.refundMethod}</strong>.
                {refundSuccess.refundMethod === 'cash' && ' Cash drawer opened.'}
              </p>
            </div>
          )}

          {!selectedOrder ? (
            /* Step 1: Select receipt to refund */
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Scan receipt barcode or type receipt number / cashier..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-[#1e1e2d] border border-[#3f3f5a] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#ee5253]"
                />
              </div>

              <div className="border border-[#3f3f5a] rounded-xl overflow-hidden max-h-80 overflow-y-auto">
                {matchingOrders.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 text-xs">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold">No refundable orders found.</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Completed orders that haven't been refunded will appear here.
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#1b1b28] text-gray-400 uppercase text-[10px] border-b border-[#3f3f5a]">
                      <tr>
                        <th className="p-2.5">Receipt #</th>
                        <th className="p-2.5">Date / Time</th>
                        <th className="p-2.5">Items</th>
                        <th className="p-2.5">Paid Via</th>
                        <th className="p-2.5">Total</th>
                        <th className="p-2.5 text-right">Select</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3f3f5a]/50">
                      {matchingOrders.map((order) => (
                        <tr
                          key={order.id}
                          onClick={() => handleSelectOrder(order)}
                          className="hover:bg-[#32324d] cursor-pointer transition-colors"
                        >
                          <td className="p-2.5 font-mono font-bold text-white">
                            #{order.orderNumber}
                          </td>
                          <td className="p-2.5 text-gray-400">
                            {new Date(order.timestamp).toLocaleString([], {
                              month: 'numeric',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="p-2.5 text-gray-300">
                            {order.items.length} item(s)
                          </td>
                          <td className="p-2.5 uppercase font-semibold text-gray-300">
                            {order.paymentMethod}
                          </td>
                          <td className="p-2.5 font-bold text-[#10ac84]">
                            ${order.total.toFixed(2)}
                          </td>
                          <td className="p-2.5 text-right">
                            <span className="px-2.5 py-1 bg-[#ee5253]/20 text-[#ee5253] border border-[#ee5253]/40 rounded font-bold text-[11px]">
                              Refund &gt;
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : (
            /* Step 2: Configure & Confirm Refund */
            <div className="space-y-4 animate-in slide-in-from-right duration-150">
              <div className="bg-[#1e1e2d] p-4 rounded-xl border border-[#3f3f5a] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Selected Order For Return
                  </span>
                  <div className="text-base font-bold text-white font-mono">
                    Receipt #{selectedOrder.orderNumber}
                  </div>
                  <span className="text-xs text-gray-400">
                    Original Cashier: {selectedOrder.cashierName} •{' '}
                    {new Date(selectedOrder.timestamp).toLocaleDateString()}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs text-gray-400 block">Total Refund Due</span>
                  <span className="text-2xl font-black font-mono text-[#ee5253]">
                    ${selectedOrder.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Items in order */}
              <div className="bg-[#1e1e2d] p-3 rounded-xl border border-[#3f3f5a] space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Returned Merchandise:
                </span>
                <div className="space-y-1 max-h-36 overflow-y-auto text-xs">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="flex justify-between py-1 border-b border-[#3f3f5a]/40 text-gray-300"
                    >
                      <span>
                        {item.qty}x {item.name}
                      </span>
                      <span className="font-mono text-white">
                        ${(item.price * item.qty * (1 - item.discount / 100)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Refund Method & Reason */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    Refund Payout Method:
                  </label>
                  <select
                    value={refundMethod}
                    onChange={(e) => setRefundMethod(e.target.value as any)}
                    className="w-full bg-[#1e1e2d] border border-[#3f3f5a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ee5253]"
                  >
                    <option value="cash">Cash (Open Till)</option>
                    <option value="card">Card Reversal (Original Card)</option>
                    <option value="storecredit">Store Credit / Gift Voucher</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    Return Reason:
                  </label>
                  <select
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="w-full bg-[#1e1e2d] border border-[#3f3f5a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ee5253]"
                  >
                    <option value="Customer Return (Unused in sleeve)">Customer Return (Unused)</option>
                    <option value="Customer Changed Mind">Customer Changed Mind</option>
                    <option value="Damaged / Bent Card">Damaged / Bent Card</option>
                    <option value="Wrong Item Scanned">Wrong Item Scanned</option>
                    <option value="Manager Courtesy Refund">Manager Courtesy Refund</option>
                  </select>
                </div>
              </div>

              {/* Confirmation Step */}
              {confirmStep ? (
                <div className="p-4 bg-red-950/60 border border-red-500 rounded-xl space-y-3 animate-in zoom-in-95">
                  <div className="flex items-center gap-2 text-red-300 font-bold text-sm">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <span>Confirm Final Refund?</span>
                  </div>
                  <p className="text-xs text-gray-200">
                    Are you sure you want to refund <strong>${selectedOrder.total.toFixed(2)}</strong> via{' '}
                    <strong className="uppercase">{refundMethod}</strong>? This will void receipt #{selectedOrder.orderNumber}
                    {refundMethod === 'cash' ? ' and open the cash drawer.' : '.'}
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setConfirmStep(false)}
                      className="px-4 py-2 bg-[#32324d] hover:bg-[#3f3f5a] text-white rounded-lg text-xs font-semibold"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleExecuteRefund}
                      className="flex-1 py-2 bg-[#ee5253] hover:bg-red-600 text-white font-black rounded-lg text-xs shadow-lg flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Confirm &amp; Process Refund</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2.5 bg-[#32324d] hover:bg-[#3f3f5a] text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    Choose Different Receipt
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmStep(true)}
                    className="flex-1 py-2.5 bg-[#ee5253] hover:bg-red-600 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Refund ${selectedOrder.total.toFixed(2)} ({refundMethod.toUpperCase()})</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
