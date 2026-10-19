import React, { useState } from 'react';
import { Tag, X, Plus } from 'lucide-react';
import { playScanBeep } from '../utils/audio';
import { DEPARTMENTS } from '../types';

interface OpenPriceModalProps {
  isOpen: boolean;
  initialPrice: string;
  is50Active: boolean;
  onClose: () => void;
  onAdd: (item: { name: string; price: number; discount: number; category: string; department?: string }) => void;
}

export const OpenPriceModal: React.FC<OpenPriceModalProps> = ({
  isOpen,
  initialPrice,
  is50Active,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState('Custom Card / Gift');
  const [priceStr, setPriceStr] = useState(initialPrice || '');
  const [apply50, setApply50] = useState(is50Active);
  const [department, setDepartment] = useState('cards');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(priceStr);
    if (!price || isNaN(price) || price <= 0) return;

    playScanBeep();
    onAdd({
      name: name.trim() || 'Custom Item',
      price,
      discount: apply50 ? 50 : 0,
      category: department,
      department,
    });
    onClose();
  };

  const quickPresets = [
    { label: 'Unlisted Card ($2.99)', name: 'Everyday Card', price: 2.99 },
    { label: 'Premium Card ($4.99)', name: 'Premium Card', price: 4.99 },
    { label: 'Luxury Card ($6.99)', name: 'Luxury Card', price: 6.99 },
    { label: 'Helium Balloon Fill ($2.50)', name: 'Helium Balloon Fill', price: 2.50 },
    { label: 'Gift Wrapping Service ($5.00)', name: 'Gift Wrapping Service', price: 5.00 },
    { label: 'Custom Gift Basket ($25.00)', name: 'Gift Basket Assembly', price: 25.00 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-[#252538] border border-[#3f3f5a] rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 bg-[#1b1b28] border-b border-[#3f3f5a]">
          <div className="flex items-center gap-2 text-[#ff9f43] font-bold text-lg">
            <Tag className="w-5 h-5" />
            <span>Open $ Custom Item</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#32324d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Item Name / Description
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Vintage Postcard, Balloon Bouquet"
              className="w-full bg-[#1e1e2d] border border-[#3f3f5a] rounded-lg px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9f43]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Unit Price ($)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  autoFocus
                  value={priceStr}
                  onChange={(e) => setPriceStr(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#1e1e2d] border border-[#3f3f5a] rounded-lg pl-8 pr-3 py-2.5 text-white text-lg font-bold placeholder-gray-500 focus:outline-none focus:border-[#ff9f43]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#1e1e2d] border border-[#3f3f5a] rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#ff9f43]"
              >
                <option value="birthday">Greeting Cards</option>
                <option value="wrap">Gift Wrap &amp; Bags</option>
                <option value="plush">Plush &amp; Toys</option>
                <option value="candles">Candles &amp; Scent</option>
                <option value="novelty">Novelty &amp; Gifts</option>
              </select>
            </div>
          </div>

          {/* Quick preset chips */}
          <div>
            <span className="block text-xs font-medium text-gray-400 mb-2">Common Quick Presets:</span>
            <div className="grid grid-cols-2 gap-1.5">
              {quickPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setName(preset.name);
                    setPriceStr(preset.price.toFixed(2));
                  }}
                  className="text-left text-xs bg-[#1e1e2d] hover:bg-[#32324d] text-gray-300 hover:text-white px-2.5 py-1.5 rounded border border-[#3f3f5a]/60 truncate transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 bg-[#1b1b28] p-3 rounded-lg border border-[#3f3f5a] cursor-pointer">
            <input
              type="checkbox"
              checked={apply50}
              onChange={(e) => setApply50(e.target.checked)}
              className="w-5 h-5 accent-[#ee5253] rounded"
            />
            <div className="text-sm">
              <span className="font-bold text-[#ff9f43]">Apply 50% Discount</span>
              <p className="text-xs text-gray-400">
                {apply50
                  ? `Discounted to: $${(parseFloat(priceStr || '0') * 0.5).toFixed(2)}`
                  : 'Regular full price'}
              </p>
            </div>
          </label>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-[#32324d] hover:bg-[#3f3f5a] text-white rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#ff9f43] hover:bg-[#f39c12] text-gray-900 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add To Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
