import React, { useState } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  Percent,
  DollarSign,
  ShoppingCart,
  RotateCcw,
  Unlock,
  Check,
} from 'lucide-react';
import { CartItem, DEPARTMENTS } from '../types';
import { playKeyTap, playToggleChime, playScanBeep } from '../utils/audio';

interface RightPanelCartProps {
  cart: CartItem[];
  is50Active: boolean;
  numpadVal: string;
  taxRate: number;
  cashierName: string;
  onToggle50Discount: () => void;
  onPressNum: (v: string) => void;
  onClearNumpad: () => void;
  onClearCart: () => void;
  onApplyCart50: () => void;
  onOpenPriceItem: () => void;
  onCheckout: () => void;
  onUpdateQty: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onToggleItemDiscount: (cartItemId: string) => void;
  onSetItemDiscountPercent: (cartItemId: string, percent: number) => void;
  onOpenCashDrawer: () => void;
  onUpdateItemUnitPrice?: (cartItemId: string, newUnitPrice: number) => void;
  onSetNumpadPrice?: (priceNum: number) => void;
  onUpdateItemDepartment?: (cartItemId: string, departmentId: string) => void;
  onAddDepartmentItem?: (departmentId: string, price: number) => void;
}

export const RightPanelCart: React.FC<RightPanelCartProps> = ({
  cart,
  is50Active,
  numpadVal,
  taxRate,
  cashierName,
  onToggle50Discount,
  onPressNum,
  onClearNumpad,
  onClearCart,
  onApplyCart50,
  onOpenPriceItem,
  onCheckout,
  onUpdateQty,
  onRemoveItem,
  onToggleItemDiscount,
  onOpenCashDrawer,
  onUpdateItemUnitPrice,
  onSetNumpadPrice,
  onUpdateItemDepartment,
  onAddDepartmentItem,
}) => {
  const [drawerKickedNotice, setDrawerKickedNotice] = useState(false);

  // Detected Unit Price from Numpad
  const detectedPriceNum = (() => {
    if (!numpadVal) return null;
    const clean = numpadVal.replace(/\D/g, '').replace(/^0+/, '');
    if (!clean) return null;
    const val = parseInt(clean, 10) / 100;
    return val > 0 ? val : null;
  })();
  const displayNumpadPrice = detectedPriceNum !== null ? detectedPriceNum.toFixed(2) : '0.00';

  // Financial calculations
  let subtotal = 0;
  let discountTotal = 0;

  cart.forEach((item) => {
    const lineSubtotal = item.price * item.qty;
    const lineDiscount = lineSubtotal * (item.discount / 100);
    subtotal += lineSubtotal;
    discountTotal += lineDiscount;
  });

  const taxableAmount = Math.max(0, subtotal - discountTotal);
  const taxAmount = taxableAmount * taxRate;
  const totalDue = taxableAmount + taxAmount;
  const totalItemCount = cart.reduce((acc, item) => acc + item.qty, 0);

  const handleNumClick = (val: string) => {
    playKeyTap();
    onPressNum(val);
  };

  const handleDrawerClick = () => {
    onOpenCashDrawer();
    setDrawerKickedNotice(true);
    setTimeout(() => setDrawerKickedNotice(false), 2200);
  };

  return (
    <div className="w-[420px] lg:w-[460px] bg-[#2b2b40] border-l-2 border-[#3f3f5a] flex flex-col h-full shrink-0 select-none">
      {/* Cart Header */}
      <div className="px-4 py-3 bg-[#1b1b28] border-b border-[#3f3f5a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-[#00d2d3]" />
          <h2 className="font-bold text-[#00d2d3] text-base tracking-wide uppercase">
            Current Order
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#32324d] text-gray-300">
            {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Open Cash Drawer button (Accessible even when cart is empty!) */}
          <button
            onClick={handleDrawerClick}
            className={`text-xs px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1.5 transition-all shadow-sm ${
              drawerKickedNotice
                ? 'bg-emerald-600 text-white border-emerald-400'
                : 'bg-[#252538] hover:bg-[#32324d] text-[#10ac84] border-[#10ac84]/50'
            }`}
            title="Open physical cash drawer (No Sale)"
          >
            {drawerKickedNotice ? <Check className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{drawerKickedNotice ? 'Drawer Opened!' : 'Open Drawer'}</span>
          </button>

          {cart.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Clear current order items?')) {
                  onClearCart();
                }
              }}
              className="text-xs text-gray-400 hover:text-[#ee5253] flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-[#32324d]"
              title="Clear all cart items"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Void</span>
            </button>
          )}

          <span className="text-[11px] font-mono text-gray-400 bg-[#252538] px-2 py-0.5 rounded border border-[#3f3f5a]">
            {cashierName}
          </span>
        </div>
      </div>

      {/* Cart Table Container */}
      <div className="flex-1 overflow-y-auto min-h-0 bg-[#242438]">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gray-400 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-[#1e1e2d] border border-[#3f3f5a] flex items-center justify-center text-[#00d2d3]">
              <ShoppingCart className="w-8 h-8 opacity-60" />
            </div>
            <div>
              <p className="font-bold text-gray-300 text-sm">Cart is Empty</p>
              <p className="text-xs text-gray-500 mt-1 max-w-[240px]">
                Tap cards on the left catalog, click rack tiers, or scan barcode.
              </p>
            </div>

            {/* Empty cart drawer opener button */}
            <div className="pt-2">
              <button
                onClick={handleDrawerClick}
                className="px-4 py-2 bg-[#1e1e2d] hover:bg-[#32324d] text-[#10ac84] border border-[#10ac84]/50 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow"
              >
                <Unlock className="w-4 h-4" />
                <span>Open Cash Drawer (No-Sale)</span>
              </button>
            </div>

            {is50Active && (
              <div className="mt-2 text-xs bg-[#ee5253]/20 border border-[#ee5253]/50 text-[#ee5253] px-3 py-1.5 rounded-lg font-bold animate-pulse">
                50% OFF Switch is currently active!
              </div>
            )}
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-[#1b1b28] text-gray-400 uppercase text-[10px] font-semibold tracking-wider border-b border-[#3f3f5a] z-10">
              <tr>
                <th className="py-2.5 px-3">Item</th>
                <th className="py-2.5 px-2 text-center">Qty</th>
                <th className="py-2.5 px-2 text-right">Price</th>
                <th className="py-2.5 px-2 text-center">Disc</th>
                <th className="py-2.5 px-3 text-right">Total</th>
                <th className="py-2.5 pr-2 text-center w-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3f3f5a]/40">
              {cart.map((item) => {
                const lineGross = item.price * item.qty;
                const lineDiscount = lineGross * (item.discount / 100);
                const lineNet = lineGross - lineDiscount;

                return (
                  <tr
                    key={item.cartItemId}
                    className="hover:bg-[#2e2e46] transition-colors group"
                  >
                    <td className="py-2 px-3 align-middle">
                      <div className="font-bold text-white text-xs leading-tight line-clamp-1">
                        {item.name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {item.code && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-[#1e1e2d] text-gray-300 font-bold border border-[#3f3f5a]">
                            {item.code}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400 font-mono">
                          ${item.price.toFixed(2)} ea
                        </span>
                      </div>

                      {/* Department Select Option for Every Single Item */}
                      <div className="flex items-center gap-1 mt-1.5">
                        <span className="text-[9px] uppercase font-bold text-gray-400 shrink-0">
                          Dept:
                        </span>
                        <select
                          value={item.department || item.category || 'cards'}
                          onChange={(e) =>
                            onUpdateItemDepartment &&
                            onUpdateItemDepartment(item.cartItemId, e.target.value)
                          }
                          className="text-[10px] bg-[#1e1e2d] text-[#00d2d3] hover:text-white border border-[#3f3f5a] hover:border-[#00d2d3] rounded px-1.5 py-0.5 font-semibold focus:outline-none cursor-pointer max-w-[135px] truncate transition-colors"
                          title="Select department for this item"
                        >
                          {DEPARTMENTS.map((dept) => (
                            <option key={dept.id} value={dept.id} className="bg-[#252538] text-white">
                              {dept.icon} {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    <td className="py-2 px-1 text-center align-middle whitespace-nowrap">
                      <div className="inline-flex items-center bg-[#1e1e2d] border border-[#3f3f5a] rounded-md overflow-hidden">
                        <button
                          onClick={() => onUpdateQty(item.cartItemId, -1)}
                          className="px-1.5 py-1 text-gray-400 hover:text-white hover:bg-[#32324d] transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 py-0.5 font-bold text-white text-xs min-w-[20px] text-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => onUpdateQty(item.cartItemId, 1)}
                          className="px-1.5 py-1 text-gray-400 hover:text-white hover:bg-[#32324d] transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    <td className="py-2 px-2 text-right align-middle">
                      <div className="font-mono text-gray-200 font-bold">
                        ${(item.price * item.qty).toFixed(2)}
                      </div>
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        <button
                          type="button"
                          onClick={() => onSetNumpadPrice && onSetNumpadPrice(item.price)}
                          className="text-[10px] text-gray-400 hover:text-[#00d2d3] font-mono transition-colors"
                          title="Click to copy this item's unit price to numpad"
                        >
                          ${item.price.toFixed(2)} ea
                        </button>
                        {detectedPriceNum !== null &&
                          Math.abs(item.price - detectedPriceNum) > 0.001 &&
                          onUpdateItemUnitPrice && (
                            <button
                              type="button"
                              onClick={() => {
                                playKeyTap();
                                onUpdateItemUnitPrice(item.cartItemId, detectedPriceNum);
                              }}
                              className="text-[9px] font-black px-1.5 py-0.5 bg-[#00d2d3] hover:bg-[#00b4b5] text-gray-950 rounded transition-all active:scale-95 shadow-sm"
                              title={`Set this item's unit price to detected numpad price $${displayNumpadPrice}`}
                            >
                              Set ${displayNumpadPrice}
                            </button>
                          )}
                      </div>
                    </td>

                    <td className="py-2 px-1 text-center align-middle">
                      <button
                        onClick={() => onToggleItemDiscount(item.cartItemId)}
                        title="Click to toggle 50% discount for this item"
                        className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border transition-colors ${
                          item.discount > 0
                            ? 'bg-[#ee5253] text-white border-red-400'
                            : 'bg-[#1e1e2d] text-gray-400 border-[#3f3f5a] hover:text-white'
                        }`}
                      >
                        {item.discount > 0 ? `${item.discount}%` : '0%'}
                      </button>
                    </td>

                    <td className="py-2 px-3 text-right align-middle font-mono font-bold text-white">
                      ${lineNet.toFixed(2)}
                    </td>

                    <td className="py-2 pr-2 text-center align-middle">
                      <button
                        onClick={() => onRemoveItem(item.cartItemId)}
                        className="text-gray-500 hover:text-[#ee5253] p-1 rounded hover:bg-[#1e1e2d] transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Cart Summary Section */}
      <div className="p-3.5 bg-[#1b1b28] border-t border-[#3f3f5a] shrink-0 space-y-1.5 text-xs">
        <div className="flex justify-between text-gray-400">
          <span>Subtotal:</span>
          <span id="subtotal-val" className="font-mono text-white font-medium">
            ${subtotal.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between text-gray-400">
          <span className="flex items-center gap-1">
            <span>Discount:</span>
            {discountTotal > 0 && (
              <span className="text-[10px] bg-red-950 text-red-400 px-1 rounded font-bold">
                PROMO
              </span>
            )}
          </span>
          <span
            id="discount-val"
            className={`font-mono font-bold ${
              discountTotal > 0 ? 'text-[#ee5253]' : 'text-gray-400'
            }`}
          >
            -${discountTotal.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between text-gray-400">
          <span>Tax ({(taxRate * 100).toFixed(0)}%):</span>
          <span id="tax-val" className="font-mono text-white font-medium">
            ${taxAmount.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between items-baseline pt-2 mt-1 border-t border-[#3f3f5a] text-sm">
          <span className="font-bold text-white uppercase tracking-wider text-xs">Total Due:</span>
          <span
            id="total-val"
            className="text-2xl font-black text-[#10ac84] font-mono tracking-tight"
          >
            ${totalDue.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Numpad & Quick Action Section */}
      <div className="p-3 bg-[#252538] border-t-2 border-[#3f3f5a] shrink-0 space-y-2.5">
        {/* 50% OFF Toggle Switch */}
        <div className="flex justify-between items-center px-3 py-2 bg-[#1b1b28] rounded-xl border border-[#3f3f5a]">
          <div className="flex flex-col">
            <span className="font-bold text-[#ff9f43] text-xs flex items-center gap-1">
              <Percent className="w-3.5 h-3.5" />
              50% OFF Switch:
            </span>
            <span className="text-[10px] text-gray-400">
              {is50Active ? 'Next card added receives 50% off' : 'Normal retail card pricing'}
            </span>
          </div>

          <button
            id="toggle-50-btn"
            onClick={() => {
              playToggleChime(!is50Active);
              onToggle50Discount();
            }}
            className={`px-4 py-1.5 font-bold rounded-lg text-xs transition-all shadow-md active:scale-95 cursor-pointer ${
              is50Active
                ? 'bg-[#ee5253] text-white shadow-red-500/20 ring-2 ring-red-400'
                : 'bg-[#576574] hover:bg-[#6c7c8c] text-white'
            }`}
          >
            {is50Active ? '50% ON' : 'OFF'}
          </button>
        </div>

        {/* Numpad Input Buffer Display (Always starts at $0.00 with automatic decimal point) */}
        <div className="bg-[#1b1b28] px-3 py-2 rounded-xl border border-[#3f3f5a] flex items-center justify-between shadow-inner">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-[#00d2d3] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00d2d3] animate-pulse"></span>
              Detected Numpad Price:
            </span>
            <span className="text-xl font-mono font-black text-white tracking-tight">
              ${displayNumpadPrice}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {detectedPriceNum !== null && (
              <button
                type="button"
                onClick={() => {
                  playScanBeep();
                  onOpenPriceItem();
                }}
                className="text-xs px-2.5 py-1.5 bg-[#00d2d3] hover:bg-[#00b4b5] text-gray-950 font-black rounded-lg transition-all shadow-md active:scale-95 flex items-center gap-1"
                title="Add card/item with this detected unit price"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add ${displayNumpadPrice}</span>
              </button>
            )}
            {numpadVal ? (
              <button
                type="button"
                onClick={onClearNumpad}
                className="text-[11px] text-gray-400 hover:text-white px-2 py-1.5 bg-[#32324d] hover:bg-[#3f3f5a] rounded-lg transition-colors font-semibold"
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>

        {/* Quick Department Select Keys */}
        <div className="bg-[#1b1b28] p-2 rounded-xl border border-[#3f3f5a]">
          <div className="text-[10px] uppercase font-bold text-gray-400 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span className="text-[#ff9f43]">🏷️</span>
              <span>Quick Department Select:</span>
            </span>
            <span className="text-[9px] text-[#00d2d3] font-semibold">
              {detectedPriceNum !== null ? `Add $${displayNumpadPrice} to Dept` : 'Select Dept'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {DEPARTMENTS.slice(0, 6).map((dept) => (
              <button
                key={dept.id}
                type="button"
                onClick={() => {
                  playScanBeep();
                  if (onAddDepartmentItem) {
                    onAddDepartmentItem(dept.id, detectedPriceNum || 0);
                  }
                }}
                className="px-2 py-1.5 bg-[#252538] hover:bg-[#32324d] hover:border-[#00d2d3] border border-[#3f3f5a] rounded-lg text-left transition-all active:scale-95 group cursor-pointer"
                title={`Add ${dept.name} item ${detectedPriceNum !== null ? `at $${displayNumpadPrice}` : ''}`}
              >
                <div className="text-[9px] font-bold text-gray-300 group-hover:text-white truncate flex items-center gap-1">
                  <span>{dept.icon}</span>
                  <span className="truncate">{dept.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Numpad Grid */}
        <div className="grid grid-cols-4 gap-2">
          {/* Row 1 */}
          <button
            className="py-3 text-base font-bold bg-[#32324d] hover:bg-[#3f3f5a] text-white rounded-lg active:scale-95 transition-all shadow-sm"
            onClick={() => handleNumClick('7')}
          >
            7
          </button>
          <button
            className="py-3 text-base font-bold bg-[#32324d] hover:bg-[#3f3f5a] text-white rounded-lg active:scale-95 transition-all shadow-sm"
            onClick={() => handleNumClick('8')}
          >
            8
          </button>
          <button
            className="py-3 text-base font-bold bg-[#32324d] hover:bg-[#3f3f5a] text-white rounded-lg active:scale-95 transition-all shadow-sm"
            onClick={() => handleNumClick('9')}
          >
            9
          </button>
          <button
            className="py-3 text-xs font-bold bg-[#ee5253] hover:bg-red-600 text-white rounded-lg active:scale-95 transition-all shadow-sm flex items-center justify-center"
            onClick={() => {
              playKeyTap();
              if (numpadVal) {
                onClearNumpad();
              } else {
                onClearCart();
              }
            }}
          >
            Clear
          </button>

          {/* Row 2 */}
          <button
            className="py-3 text-base font-bold bg-[#32324d] hover:bg-[#3f3f5a] text-white rounded-lg active:scale-95 transition-all shadow-sm"
            onClick={() => handleNumClick('4')}
          >
            4
          </button>
          <button
            className="py-3 text-base font-bold bg-[#32324d] hover:bg-[#3f3f5a] text-white rounded-lg active:scale-95 transition-all shadow-sm"
            onClick={() => handleNumClick('5')}
          >
            5
          </button>
          <button
            className="py-3 text-base font-bold bg-[#32324d] hover:bg-[#3f3f5a] text-white rounded-lg active:scale-95 transition-all shadow-sm"
            onClick={() => handleNumClick('6')}
          >
            6
          </button>
          <button
            className="py-3 text-[11px] font-bold bg-[#ff9f43] hover:bg-[#f39c12] text-gray-900 rounded-lg active:scale-95 transition-all shadow-sm leading-tight flex items-center justify-center text-center px-1"
            onClick={() => {
              playKeyTap();
              onApplyCart50();
            }}
          >
            Cart -50%
          </button>

          {/* Row 3 */}
          <button
            className="py-3 text-base font-bold bg-[#32324d] hover:bg-[#3f3f5a] text-white rounded-lg active:scale-95 transition-all shadow-sm"
            onClick={() => handleNumClick('1')}
          >
            1
          </button>
          <button
            className="py-3 text-base font-bold bg-[#32324d] hover:bg-[#3f3f5a] text-white rounded-lg active:scale-95 transition-all shadow-sm"
            onClick={() => handleNumClick('2')}
          >
            2
          </button>
          <button
            className="py-3 text-base font-bold bg-[#32324d] hover:bg-[#3f3f5a] text-white rounded-lg active:scale-95 transition-all shadow-sm"
            onClick={() => handleNumClick('3')}
          >
            3
          </button>
          <button
            className="py-3 text-[11px] font-bold bg-[#00d2d3] hover:bg-[#00b4b5] text-gray-900 rounded-lg active:scale-95 transition-all shadow-sm leading-tight flex flex-col items-center justify-center text-center px-1"
            onClick={() => {
              playKeyTap();
              onOpenPriceItem();
            }}
            title={detectedPriceNum !== null ? `Add item with unit price $${displayNumpadPrice}` : 'Add custom open price item'}
          >
            <span className="font-black text-xs">
              {detectedPriceNum !== null ? `Add $${displayNumpadPrice}` : 'Open $'}
            </span>
            <span className="text-[9px] opacity-80">
              {detectedPriceNum !== null ? 'Unit Price' : 'Custom $'}
            </span>
          </button>

          {/* Row 4 */}
          <button
            className="py-3 text-base font-bold bg-[#32324d] hover:bg-[#3f3f5a] text-white rounded-lg active:scale-95 transition-all shadow-sm"
            onClick={() => handleNumClick('0')}
          >
            0
          </button>
          <button
            className="py-3 text-base font-bold bg-[#32324d] hover:bg-[#3f3f5a] text-white rounded-lg active:scale-95 transition-all shadow-sm"
            onClick={() => handleNumClick('.')}
          >
            .
          </button>
          <button
            className="col-span-2 py-3 text-sm font-black bg-[#10ac84] hover:bg-[#0e9673] text-white rounded-lg active:scale-95 transition-all shadow-lg flex items-center justify-center gap-1.5 uppercase tracking-wide cursor-pointer"
            onClick={onCheckout}
          >
            <DollarSign className="w-4 h-4" />
            <span>PAY CASH</span>
          </button>
        </div>
      </div>
    </div>
  );
};
