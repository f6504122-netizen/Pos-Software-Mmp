import React, { useState } from 'react';
import { Settings, X, Save, RotateCcw, Check, Eye } from 'lucide-react';
import { ReceiptSettings } from '../types';
import { DEFAULT_RECEIPT_SETTINGS } from '../data/defaultReceiptSettings';

interface CustomizeReceiptModalProps {
  isOpen: boolean;
  settings: ReceiptSettings;
  onClose: () => void;
  onSave: (newSettings: ReceiptSettings) => void;
}

export const CustomizeReceiptModal: React.FC<CustomizeReceiptModalProps> = ({
  isOpen,
  settings,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<ReceiptSettings>({ ...settings });
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field: keyof ReceiptSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 800);
  };

  const handleReset = () => {
    if (confirm('Reset receipt template to store defaults?')) {
      setFormData({ ...DEFAULT_RECEIPT_SETTINGS });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#252538] border border-[#3f3f5a] rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1b1b28] border-b border-[#3f3f5a]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-[#00d2d3] flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Customize Receipt Template</h3>
              <p className="text-xs text-gray-400">Configure store branding, tax rates, return policy &amp; printer layout</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#32324d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: 2-column layout (Left: Form controls, Right: Live Thermal Receipt Preview) */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Form */}
          <form onSubmit={handleSave} className="md:col-span-7 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Store / Business Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.storeName}
                  onChange={(e) => handleChange('storeName', e.target.value)}
                  className="w-full bg-[#1e1e2d] border border-[#3f3f5a] rounded-lg px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-[#00d2d3]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Tagline / Subheader
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  className="w-full bg-[#1e1e2d] border border-[#3f3f5a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d2d3]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full bg-[#1e1e2d] border border-[#3f3f5a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d2d3]"
                />
              </div>

              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Store Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full bg-[#1e1e2d] border border-[#3f3f5a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d2d3]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Tax Rate (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={(formData.taxRate * 100).toFixed(2)}
                    onChange={(e) =>
                      handleChange('taxRate', (parseFloat(e.target.value) || 0) / 100)
                    }
                    className="w-full bg-[#1e1e2d] border border-[#3f3f5a] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00d2d3]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Tax Registration / VAT ID
                </label>
                <input
                  type="text"
                  value={formData.taxId}
                  onChange={(e) => handleChange('taxId', e.target.value)}
                  className="w-full bg-[#1e1e2d] border border-[#3f3f5a] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00d2d3]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Receipt Header Welcome Message
              </label>
              <input
                type="text"
                value={formData.headerNote}
                onChange={(e) => handleChange('headerNote', e.target.value)}
                className="w-full bg-[#1e1e2d] border border-[#3f3f5a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d2d3]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Footer Thank You Message
              </label>
              <input
                type="text"
                value={formData.footerNote1}
                onChange={(e) => handleChange('footerNote1', e.target.value)}
                className="w-full bg-[#1e1e2d] border border-[#3f3f5a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d2d3]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Return Policy / Terms
              </label>
              <textarea
                rows={2}
                value={formData.footerNote2}
                onChange={(e) => handleChange('footerNote2', e.target.value)}
                className="w-full bg-[#1e1e2d] border border-[#3f3f5a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d2d3]"
              />
            </div>

            {/* Display Toggles */}
            <div className="bg-[#1e1e2d] p-3 rounded-lg border border-[#3f3f5a] space-y-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Printer Elements
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showBarcode}
                    onChange={(e) => handleChange('showBarcode', e.target.checked)}
                    className="accent-[#00d2d3] rounded"
                  />
                  <span>Print Barcode at bottom</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showCashier}
                    onChange={(e) => handleChange('showCashier', e.target.checked)}
                    className="accent-[#00d2d3] rounded"
                  />
                  <span>Show Cashier Name</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showItemCode}
                    onChange={(e) => handleChange('showItemCode', e.target.checked)}
                    className="accent-[#00d2d3] rounded"
                  />
                  <span>Show Rack Code / Tier</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 bg-[#32324d] hover:bg-[#3f3f5a] text-gray-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Defaults</span>
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#10ac84] hover:bg-[#0e9673] text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                {savedNotice ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{savedNotice ? 'Receipt Settings Saved!' : 'Save Receipt Template'}</span>
              </button>
            </div>
          </form>

          {/* Live Preview Column */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#00d2d3]" />
              <span>Live Thermal Receipt Preview</span>
            </div>

            <div className="bg-white text-gray-900 font-mono text-[11px] p-5 shadow-2xl rounded-sm w-full max-w-[290px] border border-gray-300 select-none">
              <div className="text-center pb-2.5 border-b border-dashed border-gray-400">
                <h4 className="font-bold text-xs uppercase tracking-wider">{formData.storeName || 'MY STORE'}</h4>
                {formData.tagline && <p className="text-[10px] text-gray-600">{formData.tagline}</p>}
                {formData.address && <p className="text-[9px] text-gray-500 mt-0.5">{formData.address}</p>}
                {formData.phone && <p className="text-[9px] text-gray-500">{formData.phone}</p>}
                {formData.taxId && <p className="text-[9px] text-gray-400">TAX ID: {formData.taxId}</p>}
                {formData.headerNote && <p className="text-[9px] text-gray-600 italic mt-1">{formData.headerNote}</p>}
              </div>

              <div className="py-2 text-[10px] border-b border-dashed border-gray-300 space-y-0.5">
                <div className="flex justify-between">
                  <span>Receipt: <strong>#SAMPLE-101</strong></span>
                  <span>12:45 PM</span>
                </div>
                {formData.showCashier && (
                  <div className="flex justify-between text-gray-600">
                    <span>Cashier: Cashier #01</span>
                    <span>10/18/2026</span>
                  </div>
                )}
              </div>

              {/* Sample Items */}
              <div className="py-2 border-b border-dashed border-gray-300 space-y-1">
                <div>
                  <div className="flex justify-between font-semibold">
                    <span>1x Birthday Foil Card</span>
                    <span>$2.00</span>
                  </div>
                  <div className="text-[9px] text-red-600">
                    50% PROMO DISCOUNT (-$2.00)
                  </div>
                  {formData.showItemCode && (
                    <div className="text-[9px] text-gray-500">Tier C @ $3.99</div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between font-semibold">
                    <span>1x Jumbo Gift Bag</span>
                    <span>$3.49</span>
                  </div>
                  <div className="text-[9px] text-gray-500">Wrap @ $3.49</div>
                </div>
              </div>

              {/* Financials */}
              <div className="py-2 text-[10px] space-y-0.5 border-b border-dashed border-gray-300">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>$7.48</span>
                </div>
                <div className="flex justify-between text-red-600 font-semibold">
                  <span>Discounts:</span>
                  <span>-$2.00</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax ({(formData.taxRate * 100).toFixed(1)}%):</span>
                  <span>${((7.48 - 2.0) * formData.taxRate).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-gray-800 text-gray-900">
                  <span>TOTAL DUE:</span>
                  <span>${((7.48 - 2.0) * (1 + formData.taxRate)).toFixed(2)}</span>
                </div>
              </div>

              {/* Tender */}
              <div className="py-1.5 text-[9px] text-gray-600 space-y-0.5 border-b border-dashed border-gray-300">
                <div className="flex justify-between">
                  <span>Paid: CASH</span>
                  <span>$10.00</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900">
                  <span>CHANGE:</span>
                  <span>${(10 - (7.48 - 2.0) * (1 + formData.taxRate)).toFixed(2)}</span>
                </div>
              </div>

              {/* Footer messages */}
              <div className="pt-2 text-center text-[9px] space-y-1">
                {formData.footerNote1 && <p className="font-semibold text-gray-700">{formData.footerNote1}</p>}
                {formData.footerNote2 && <p className="text-gray-500 text-[8px] leading-tight">{formData.footerNote2}</p>}
                {formData.showBarcode && (
                  <div className="pt-1.5">
                    <div className="tracking-widest font-mono text-[9px] text-gray-400">|||| |||||| ||||| |||||||</div>
                    <span className="text-[8px] text-gray-400">#SAMPLE-101</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
