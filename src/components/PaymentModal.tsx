import React, { useState, useEffect } from 'react';
import { DollarSign, CreditCard, Gift, X, Check, ArrowRight, Zap } from 'lucide-react';
import { playCashRegisterDing, playKeyTap } from '../utils/audio';

interface PaymentModalProps {
  isOpen: boolean;
  total: number;
  onClose: () => void;
  onCompleteSale: (paymentDetails: {
    method: 'cash' | 'card' | 'split' | 'giftcard';
    tenderedAmount: number;
    changeDue: number;
  }) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  total,
  onClose,
  onCompleteSale,
}) => {
  const [method, setMethod] = useState<'cash' | 'card' | 'giftcard' | 'split'>('cash');
  // Starts clean at empty / $0.00 as requested
  const [tenderedStr, setTenderedStr] = useState<string>('');
  const [cardProcessing, setCardProcessing] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setMethod('cash');
      setTenderedStr(''); // Starts at $0.00
      setCardProcessing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const tendered = parseFloat(tenderedStr) || 0;
  const changeDue = Math.max(0, tendered - total);
  const remainingDue = Math.max(0, total - tendered);

  // Quick cash bill increments
  const nextWholeDollar = Math.ceil(total);
  const quickBills = [
    ...(nextWholeDollar > total ? [{ label: `$${nextWholeDollar}.00`, amount: nextWholeDollar }] : []),
    ...(total <= 5 ? [{ label: '$5.00', amount: 5 }] : []),
    ...(total <= 10 ? [{ label: '$10.00', amount: 10 }] : []),
    ...(total <= 20 ? [{ label: '$20.00', amount: 20 }] : []),
    ...(total <= 50 ? [{ label: '$50.00', amount: 50 }] : []),
    { label: '$100.00', amount: 100 },
  ].filter((item, index, self) => index === self.findIndex((t) => t.amount === item.amount));

  // Immediate 1-click completion on Exact Cash Tendered
  const handleExactCashAndComplete = () => {
    playCashRegisterDing();
    onCompleteSale({
      method: 'cash',
      tenderedAmount: total,
      changeDue: 0,
    });
  };

  const handleCashKey = (digit: string) => {
    playKeyTap();
    if (digit === 'C') {
      setTenderedStr('');
      return;
    }
    if (digit === '.') {
      setTenderedStr((prev) => {
        const clean = prev.replace(/\D/g, '').replace(/^0+/, '');
        if (!clean) return '';
        const dollars = parseInt(clean, 10);
        return dollars.toFixed(2);
      });
      return;
    }
    if (digit === '00') {
      setTenderedStr((prev) => {
        const clean = prev.replace(/\D/g, '').replace(/^0+/, '');
        if (!clean) return '';
        const cents = parseInt(clean + '00', 10);
        return (cents / 100).toFixed(2);
      });
      return;
    }
    // Single digit: automatically shift digits with decimal point fixed at 2 places
    setTenderedStr((prev) => {
      const clean = prev.replace(/\D/g, '').replace(/^0+/, '');
      if (clean.length >= 7) return prev;
      const newDigits = clean + digit;
      const cents = parseInt(newDigits, 10);
      return (cents / 100).toFixed(2);
    });
  };

  const handleFinalizeCash = () => {
    if (tendered < total) {
      alert(`Tendered amount ($${tendered.toFixed(2)}) is less than total due ($${total.toFixed(2)}).`);
      return;
    }
    playCashRegisterDing();
    onCompleteSale({
      method: 'cash',
      tenderedAmount: tendered,
      changeDue: changeDue,
    });
  };

  const handleFinalizeCard = () => {
    setCardProcessing(true);
    setTimeout(() => {
      playCashRegisterDing();
      onCompleteSale({
        method: 'card',
        tenderedAmount: total,
        changeDue: 0,
      });
    }, 600);
  };

  const handleFinalizeGiftCard = () => {
    playCashRegisterDing();
    onCompleteSale({
      method: 'giftcard',
      tenderedAmount: total,
      changeDue: 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="bg-[#252538] border border-[#3f3f5a] rounded-xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1b1b28] border-b border-[#3f3f5a]">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <DollarSign className="w-5 h-5 text-[#10ac84]" />
            <span>Process Payment</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#32324d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Banner */}
        <div className="bg-[#1e1e2d] px-6 py-4 border-b border-[#3f3f5a] flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Total Amount Due</span>
            <div className="text-3xl font-extrabold text-[#10ac84] tracking-tight">
              ${total.toFixed(2)}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="flex bg-[#2b2b40] p-1 rounded-lg border border-[#3f3f5a] gap-1">
            <button
              onClick={() => setMethod('cash')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                method === 'cash' ? 'bg-[#10ac84] text-white shadow' : 'text-gray-300 hover:text-white'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Cash
            </button>
            <button
              onClick={() => setMethod('card')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                method === 'card' ? 'bg-[#3b82f6] text-white shadow' : 'text-gray-300 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Card
            </button>
            <button
              onClick={() => setMethod('giftcard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                method === 'giftcard' ? 'bg-[#ec4899] text-white shadow' : 'text-gray-300 hover:text-white'
              }`}
            >
              <Gift className="w-4 h-4" />
              Gift Card
            </button>
          </div>
        </div>

        {/* Payment Method Content */}
        <div className="p-6">
          {method === 'cash' && (
            <div className="space-y-4">
              {/* Exact Cash 1-Click Complete Button & Quick Tender Bills */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-semibold block">Quick Cash Tender:</span>
                  <span className="text-[11px] text-[#10ac84] font-bold">1-Click Exact Finish</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* Dedicated 1-Click Exact Cash Complete Button */}
                  <button
                    type="button"
                    onClick={handleExactCashAndComplete}
                    className="col-span-2 py-2.5 px-3 bg-[#10ac84] hover:bg-[#0e9673] text-white font-black rounded-lg text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 border border-emerald-400"
                    title="Complete sale immediately with exact cash"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Exact Cash (${total.toFixed(2)})</span>
                  </button>

                  {/* Standard bill shortcuts */}
                  {quickBills.map((b, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        playKeyTap();
                        setTenderedStr(b.amount.toFixed(2));
                      }}
                      className="py-2.5 bg-[#32324d] hover:bg-[#3f3f5a] text-[#00d2d3] font-bold rounded-lg border border-[#3f3f5a] text-xs transition-colors"
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tendered Input & Change Readout (Starts at $0.00) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1e1e2d] p-3.5 rounded-xl border border-[#3f3f5a]">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs text-gray-400 font-semibold block">Cash Tendered ($)</label>
                    <button
                      type="button"
                      onClick={() => setTenderedStr('')}
                      className="text-[10px] text-gray-500 hover:text-white"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex items-center text-2xl font-bold text-white">
                    <span className="text-gray-400 mr-1">$</span>
                    <input
                      type="text"
                      value={tenderedStr}
                      placeholder="0.00"
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.]/g, '');
                        setTenderedStr(val);
                      }}
                      className="w-full bg-transparent focus:outline-none font-mono text-white placeholder-gray-500"
                      autoFocus
                    />
                  </div>
                </div>

                <div
                  className={`p-3.5 rounded-xl border ${
                    tendered >= total && tendered > 0
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                      : 'bg-amber-950/40 border-amber-500/40 text-amber-400'
                  }`}
                >
                  <label className="text-xs uppercase tracking-wider font-semibold block mb-1">
                    {tendered >= total && tendered > 0 ? 'Change Due' : 'Remaining Due'}
                  </label>
                  <div className="text-2xl font-black font-mono">
                    ${tendered >= total && tendered > 0 ? changeDue.toFixed(2) : remainingDue.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Mini numpad for cash input (starts at $0.00) */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                {['7', '8', '9', 'C', '4', '5', '6', '20', '1', '2', '3', '50', '0', '00', '.', 'Exact'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      if (k === 'Exact') {
                        handleExactCashAndComplete(); // 1-click complete!
                      } else if (k === '20') {
                        setTenderedStr('20.00');
                      } else if (k === '50') {
                        setTenderedStr('50.00');
                      } else {
                        handleCashKey(k);
                      }
                    }}
                    className={`py-2 rounded-lg font-bold text-sm transition-colors ${
                      k === 'C'
                        ? 'bg-[#ee5253] text-white hover:bg-red-600'
                        : k === 'Exact'
                        ? 'bg-[#10ac84] text-white hover:bg-emerald-600 shadow'
                        : 'bg-[#2b2b40] hover:bg-[#3f3f5a] text-white'
                    }`}
                  >
                    {k === 'Exact' ? '⚡ Exact' : k}
                  </button>
                ))}
              </div>

              {/* Complete Cash Button */}
              <button
                type="button"
                onClick={handleFinalizeCash}
                disabled={tendered < total}
                className={`w-full py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
                  tendered >= total
                    ? 'bg-[#10ac84] hover:bg-[#0e9673] text-white cursor-pointer active:scale-95'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-60'
                }`}
              >
                <span>Complete Cash Sale</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {method === 'card' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-blue-900/30 border-2 border-blue-500/50 flex items-center justify-center text-blue-400">
                <CreditCard className="w-10 h-10 animate-pulse" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">EMV Chip / Contactless Terminal Ready</h4>
                <p className="text-sm text-gray-400 mt-1">
                  Instruct customer to Tap, Insert chip, or Swipe on reader.
                </p>
                <div className="mt-3 inline-block px-3 py-1 bg-[#1e1e2d] border border-[#3f3f5a] rounded-full text-xs text-[#00d2d3]">
                  Awaiting Terminal Approval for ${total.toFixed(2)}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-[#32324d] hover:bg-[#3f3f5a] text-white rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleFinalizeCard}
                  disabled={cardProcessing}
                  className="flex-1 py-3 bg-[#3b82f6] hover:bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg"
                >
                  {cardProcessing ? (
                    <span>Authorizing...</span>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Approve Card (${total.toFixed(2)})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {method === 'giftcard' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-semibold block mb-1">
                  Scan or Enter Gift Card #
                </label>
                <input
                  type="text"
                  placeholder="e.g. GC-9842-8812"
                  defaultValue="GC-7749-3320"
                  className="w-full bg-[#1e1e2d] border border-[#3f3f5a] rounded-lg px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-[#ec4899]"
                />
              </div>
              <div className="bg-[#1e1e2d] p-3 rounded-lg border border-[#3f3f5a] flex justify-between items-center text-sm">
                <span className="text-gray-400">Card Verified Balance:</span>
                <span className="text-[#ec4899] font-bold text-base">$50.00</span>
              </div>
              <button
                type="button"
                onClick={handleFinalizeGiftCard}
                className="w-full py-3.5 bg-[#ec4899] hover:bg-pink-600 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-colors shadow-lg"
              >
                <span>Redeem Gift Card (${total.toFixed(2)})</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
