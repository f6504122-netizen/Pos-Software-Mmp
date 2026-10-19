import React from 'react';
import { Printer, X, CheckCircle, Copy, Check } from 'lucide-react';
import { Order, ReceiptSettings } from '../types';
import { DEFAULT_RECEIPT_SETTINGS } from '../data/defaultReceiptSettings';

interface ReceiptModalProps {
  order: Order | null;
  settings?: ReceiptSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  order,
  settings = DEFAULT_RECEIPT_SETTINGS,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const lines = [
      '========================================',
      `    ${(settings.storeName || 'GREETING CARDS POS').toUpperCase()} `,
      settings.tagline ? `    ${settings.tagline}` : '',
      settings.address ? `    ${settings.address}` : '',
      settings.phone ? `    Tel: ${settings.phone}` : '',
      settings.taxId ? `    Tax ID: ${settings.taxId}` : '',
      '========================================',
      `Receipt: ${order.orderNumber}`,
      `Date: ${new Date(order.timestamp).toLocaleString()}`,
      settings.showCashier ? `Cashier: ${order.cashierName}` : '',
      '----------------------------------------',
      ...order.items.map(
        (item) =>
          `${item.qty}x ${item.name.padEnd(20).substring(0, 20)} $${(
            item.price * item.qty * (1 - item.discount / 100)
          ).toFixed(2)}${item.discount > 0 ? ` (-${item.discount}%)` : ''}`
      ),
      '----------------------------------------',
      `Subtotal:        $${order.subtotal.toFixed(2)}`,
      `Discount Total: -$${order.discountTotal.toFixed(2)}`,
      `Tax (${(order.taxRate * 100).toFixed(1)}%):       $${order.taxAmount.toFixed(2)}`,
      `TOTAL:           $${order.total.toFixed(2)}`,
      '----------------------------------------',
      `Payment: ${order.paymentMethod.toUpperCase()}`,
      `Tendered:        $${order.tenderedAmount.toFixed(2)}`,
      `Change Due:      $${order.changeDue.toFixed(2)}`,
      '========================================',
      settings.footerNote1 ? ` ${settings.footerNote1}` : '',
      settings.footerNote2 ? ` ${settings.footerNote2}` : '',
      '========================================',
    ].filter(Boolean);

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#252538] border border-[#3f3f5a] rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#1b1b28] border-b border-[#3f3f5a]">
          <div className="flex items-center gap-2 text-[#10ac84] font-bold">
            <CheckCircle className="w-5 h-5" />
            <span>Sale Completed Successfully</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#32324d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Receipt Paper View */}
        <div className="p-6 overflow-y-auto bg-[#1e1e2d] flex justify-center">
          <div
            id="printable-receipt"
            className="bg-white text-gray-900 font-mono text-xs p-6 shadow-xl rounded-sm w-[340px] border border-gray-300 relative select-text"
          >
            {/* Header */}
            <div className="text-center pb-3 border-b border-dashed border-gray-400">
              <h2 className="font-bold text-sm tracking-widest uppercase">
                {settings.storeName || 'GREETING CARDS & GIFTS'}
              </h2>
              {settings.tagline && <p className="text-[11px] text-gray-600">{settings.tagline}</p>}
              {settings.address && <p className="text-[10px] text-gray-500">{settings.address}</p>}
              {settings.phone && <p className="text-[10px] text-gray-500">Tel: {settings.phone}</p>}
              {settings.taxId && <p className="text-[9px] text-gray-400">TAX ID: {settings.taxId}</p>}
              {settings.headerNote && (
                <p className="text-[10px] text-gray-600 italic mt-1">{settings.headerNote}</p>
              )}
            </div>

            {/* Meta */}
            <div className="py-2.5 text-[11px] space-y-0.5 border-b border-dashed border-gray-300">
              <div className="flex justify-between">
                <span>Receipt: <strong className="font-bold">{order.orderNumber}</strong></span>
                <span>{new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex justify-between">
                <span>Date: {new Date(order.timestamp).toLocaleDateString()}</span>
                {settings.showCashier && <span>Cashier: {order.cashierName}</span>}
              </div>
            </div>

            {/* Items */}
            <div className="py-3 border-b border-dashed border-gray-400">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-300 text-[10px] text-gray-500 uppercase">
                    <th className="pb-1 font-semibold">Qty &amp; Item</th>
                    <th className="pb-1 text-right font-semibold">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dotted divide-gray-200">
                  {order.items.map((item) => {
                    const lineOriginal = item.price * item.qty;
                    const lineDiscount = lineOriginal * (item.discount / 100);
                    const lineTotal = lineOriginal - lineDiscount;
                    return (
                      <tr key={item.cartItemId} className="align-top">
                        <td className="py-1 pr-1">
                          <div className="font-semibold text-gray-800">
                            {item.qty}x {item.name}
                          </div>
                          {item.discount > 0 && (
                            <div className="text-[10px] text-red-600 font-medium">
                              {item.discount}% DISCOUNT (-${lineDiscount.toFixed(2)})
                            </div>
                          )}
                          <div className="text-[10px] text-gray-500">
                            {settings.showItemCode && item.code ? `[${item.code}] ` : ''}
                            @ ${item.price.toFixed(2)} ea
                          </div>
                        </td>
                        <td className="py-1 text-right font-bold text-gray-900 whitespace-nowrap">
                          ${lineTotal.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Financials */}
            <div className="py-2.5 space-y-1 text-[11px] border-b border-dashed border-gray-400">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              {order.discountTotal > 0 && (
                <div className="flex justify-between text-red-600 font-semibold">
                  <span>Total Discount:</span>
                  <span>-${order.discountTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Sales Tax ({(order.taxRate * 100).toFixed(1)}%):</span>
                <span>${order.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-gray-800 pt-1.5 mt-1">
                <span>TOTAL DUE:</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Tender & Change */}
            <div className="py-2 text-[11px] space-y-0.5 border-b border-dashed border-gray-400">
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-bold uppercase">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount Tendered:</span>
                <span>${order.tenderedAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900">
                <span>CHANGE DUE:</span>
                <span>${order.changeDue.toFixed(2)}</span>
              </div>
            </div>

            {/* Barcode & Footer Messages */}
            <div className="pt-3 text-center space-y-1">
              {settings.footerNote1 && (
                <p className="text-[10px] text-gray-600 font-sans italic">
                  {settings.footerNote1}
                </p>
              )}
              {settings.footerNote2 && (
                <p className="text-[9px] text-gray-400 leading-tight">
                  {settings.footerNote2}
                </p>
              )}
              {settings.showBarcode && (
                <div className="pt-2">
                  <div className="tracking-widest font-mono text-[10px] text-gray-500 mb-0.5">
                    |||||| | |||||||| |||| | ||| |||||||
                  </div>
                  <p className="text-[9px] text-gray-400">#POS-{order.orderNumber}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-[#1b1b28] border-t border-[#3f3f5a] flex gap-2">
          <button
            onClick={handleCopyText}
            className="px-3 py-2.5 bg-[#32324d] hover:bg-[#3f3f5a] text-gray-200 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-[#00d2d3] hover:bg-[#00b4b5] text-gray-900 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-[#10ac84] hover:bg-[#0e9673] text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            <span>Next Customer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
