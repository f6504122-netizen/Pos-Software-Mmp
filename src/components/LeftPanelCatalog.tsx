import React, { useState, useRef } from 'react';
import { Search, Barcode, Tag, Filter, X, Sparkles } from 'lucide-react';
import { Product, CategoryId } from '../types';
import { playScanBeep } from '../utils/audio';

interface LeftPanelCatalogProps {
  products: Product[];
  is50Active: boolean;
  numpadVal?: string;
  onClearNumpad?: () => void;
  onAddToCart: (product: Product) => void;
  onQuickPriceTier: (code: string, price: number, name: string) => void;
}

const CATEGORIES: { id: CategoryId; label: string; icon: string }[] = [
  { id: 'all', label: 'All Items', icon: '🏪' },
  { id: 'price-codes', label: 'Rack Tiers', icon: '🏷️' },
  { id: 'birthday', label: 'Birthday', icon: '🎂' },
  { id: 'holiday', label: 'Holiday & Seasonal', icon: '🎄' },
  { id: 'anniversary', label: 'Love & Anniversary', icon: '💖' },
  { id: 'sympathy', label: 'Sympathy & Care', icon: '🕊️' },
  { id: 'wrap', label: 'Wrap & Bags', icon: '🎁' },
  { id: 'plush', label: 'Plush & Toys', icon: '🧸' },
  { id: 'candles', label: 'Candles', icon: '🕯️' },
  { id: 'novelty', label: 'Novelty & Gifts', icon: '🎈' },
];

const RACK_TIERS = [
  { code: 'Tier A', price: 2.99, name: 'Card Code A (Standard)', color: 'border-blue-500/50 hover:bg-blue-950/40' },
  { code: 'Tier B', price: 3.99, name: 'Card Code B (Embossed)', color: 'border-purple-500/50 hover:bg-purple-950/40' },
  { code: 'Tier C', price: 4.99, name: 'Card Code C (Foil/Glitter)', color: 'border-pink-500/50 hover:bg-pink-950/40' },
  { code: 'Tier D', price: 5.99, name: 'Card Code D (3D Pop-Up)', color: 'border-amber-500/50 hover:bg-amber-950/40' },
  { code: 'Tier E', price: 7.99, name: 'Card Code E (Musical)', color: 'border-emerald-500/50 hover:bg-emerald-950/40' },
  { code: 'Tier F', price: 9.99, name: 'Card Code F (Wood Keepsake)', color: 'border-indigo-500/50 hover:bg-indigo-950/40' },
];

export const LeftPanelCatalog: React.FC<LeftPanelCatalogProps> = ({
  products,
  is50Active,
  numpadVal = '',
  onClearNumpad,
  onAddToCart,
  onQuickPriceTier,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Detect unit price from numpad if user has typed any amount > 0
  const detectedUnitPrice = (() => {
    if (!numpadVal) return null;
    const clean = numpadVal.replace(/\D/g, '').replace(/^0+/, '');
    if (!clean) return null;
    const val = parseInt(clean, 10) / 100;
    return val > 0 ? val : null;
  })();

  const matchingProducts =
    detectedUnitPrice !== null
      ? products.filter((p) => Math.abs(p.price - detectedUnitPrice) < 0.005)
      : [];

  const matchingTiers =
    detectedUnitPrice !== null
      ? RACK_TIERS.filter((t) => Math.abs(t.price - detectedUnitPrice) < 0.005)
      : [];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesCategory;

    const matchesName = p.name.toLowerCase().includes(query);
    const matchesBarcode = p.barcode.toLowerCase().includes(query);
    const matchesCode = p.code ? p.code.toLowerCase().includes(query) : false;

    return (matchesName || matchesBarcode || matchesCode) && matchesCategory;
  });

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = searchQuery.trim().toLowerCase();
      if (!query) return;

      // Exact barcode match first
      const exactBarcode = products.find((p) => p.barcode.toLowerCase() === query);
      if (exactBarcode) {
        playScanBeep();
        const effectivePrice =
          detectedUnitPrice !== null ? detectedUnitPrice : exactBarcode.price;
        onAddToCart({ ...exactBarcode, price: effectivePrice });
        setSearchQuery('');
        return;
      }

      // First matching product
      if (filteredProducts.length > 0) {
        playScanBeep();
        const effectivePrice =
          detectedUnitPrice !== null ? detectedUnitPrice : filteredProducts[0].price;
        onAddToCart({ ...filteredProducts[0], price: effectivePrice });
        setSearchQuery('');
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1e1e2d] overflow-hidden">
      {/* Numpad Unit Price Override & Match Banner */}
      {detectedUnitPrice !== null && (
        <div className="bg-[#00d2d3]/15 border-b border-[#00d2d3]/50 px-4 py-2 flex flex-wrap items-center justify-between gap-2 animate-in slide-in-from-top duration-150">
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00d2d3] animate-ping"></span>
            <span className="text-[#00d2d3] font-black text-sm">
              Detected Numpad Unit Price: ${detectedUnitPrice.toFixed(2)}
            </span>
            <span className="text-gray-300 hidden sm:inline">
              (Will apply as unit price to next item/card selected)
            </span>

            {/* Same price matching tiers and products */}
            {matchingTiers.length > 0 && (
              <span className="inline-flex items-center gap-1 bg-[#00d2d3]/20 text-[#00d2d3] px-2 py-0.5 rounded-md font-bold text-[11px] border border-[#00d2d3]/40">
                <span>Same Price Tier:</span>
                <strong>{matchingTiers.map((t) => `${t.code} ($${t.price.toFixed(2)})`).join(', ')}</strong>
              </span>
            )}

            {matchingProducts.length > 0 && (
              <span className="inline-flex items-center gap-1 bg-emerald-950/60 text-emerald-300 px-2 py-0.5 rounded-md font-bold text-[11px] border border-emerald-500/40">
                <span>Same Price Item:</span>
                <strong>{matchingProducts[0].name} (${matchingProducts[0].price.toFixed(2)})</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playScanBeep();
                onQuickPriceTier(
                  matchingTiers[0]?.code || 'Code $',
                  detectedUnitPrice,
                  matchingTiers[0]?.name || `Greeting Card ($${detectedUnitPrice.toFixed(2)})`
                );
              }}
              className="text-xs bg-[#00d2d3] hover:bg-[#00b4b5] text-gray-950 px-2.5 py-1 rounded-lg font-black transition-all shadow active:scale-95 flex items-center gap-1"
              title="Add card at this detected unit price"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>+ Add ${detectedUnitPrice.toFixed(2)} Card</span>
            </button>
            {onClearNumpad && (
              <button
                onClick={onClearNumpad}
                className="text-[10px] bg-[#1e1e2d] hover:bg-[#32324d] text-gray-300 px-2 py-1 rounded border border-[#3f3f5a] font-semibold transition-colors"
              >
                Clear Price
              </button>
            )}
          </div>
        </div>
      )}

      {/* Top Search & Barcode Scan Bar */}
      <div className="p-3 bg-[#252538] border-b border-[#3f3f5a] flex items-center gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Barcode className="w-5 h-5 text-[#00d2d3]" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Scan barcode SKU or search card name, code... (Press Enter to add)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-full bg-[#1e1e2d] border border-[#3f3f5a] rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#00d2d3] focus:ring-1 focus:ring-[#00d2d3] transition-all font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => {
            searchInputRef.current?.focus();
            setSearchQuery('');
          }}
          title="Quick Barcode Scanner Ready"
          className="px-3 py-2.5 bg-[#32324d] hover:bg-[#3f3f5a] border border-[#3f3f5a] rounded-xl text-xs font-semibold text-gray-200 flex items-center gap-1.5 transition-colors shrink-0"
        >
          <Search className="w-4 h-4 text-[#00d2d3]" />
          <span className="hidden sm:inline">Scan Ready</span>
        </button>
      </div>

      {/* Greeting Card Quick Price Code Rack Bar */}
      <div className="px-3 py-2 bg-[#1b1b28] border-b border-[#3f3f5a] flex items-center gap-2 overflow-x-auto scrollbar-none">
        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Tag className="w-3.5 h-3.5 text-[#ff9f43]" />
          <span className="hidden md:inline">Rack Tiers:</span>
        </div>

        <div className="flex gap-1.5">
          {RACK_TIERS.map((tier) => {
            const isExactMatch =
              detectedUnitPrice !== null && Math.abs(tier.price - detectedUnitPrice) < 0.005;
            const basePrice = detectedUnitPrice !== null ? detectedUnitPrice : tier.price;
            const finalPrice = is50Active ? basePrice * 0.5 : basePrice;
            return (
              <button
                key={tier.code}
                onClick={() => {
                  playScanBeep();
                  onQuickPriceTier(tier.code, basePrice, tier.name);
                }}
                className={`px-2.5 py-1.5 rounded-lg border bg-[#252538] text-left shrink-0 transition-all ${
                  isExactMatch
                    ? 'border-[#00d2d3] bg-[#00d2d3]/20 ring-2 ring-[#00d2d3] shadow-md shadow-[#00d2d3]/20'
                    : tier.color
                } active:scale-95`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] text-gray-300 font-bold uppercase">{tier.code}</span>
                  {isExactMatch && (
                    <span className="text-[9px] bg-[#00d2d3] text-gray-950 font-black px-1 rounded">
                      SAME PRICE
                    </span>
                  )}
                </div>
                <div className="text-xs font-black">
                  {is50Active ? (
                    <span className="text-[#ee5253]">${finalPrice.toFixed(2)}</span>
                  ) : (
                    <span className="text-[#00d2d3]">${finalPrice.toFixed(2)}</span>
                  )}
                  {detectedUnitPrice !== null && !isExactMatch && (
                    <span className="text-[9px] text-[#ff9f43] block font-bold leading-tight">
                      (Numpad)
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-3 py-2 bg-[#252538] border-b border-[#3f3f5a] flex items-center gap-1.5 overflow-x-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? 'bg-[#00d2d3] text-gray-900 shadow-md font-extrabold'
                : 'bg-[#32324d] text-gray-300 hover:text-white hover:bg-[#3f3f5a]'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredProducts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 py-12">
            <Filter className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-base font-semibold">No cards or gifts in this view.</p>
            <p className="text-xs text-gray-400 mt-1">
              Add products or import a CSV from the <strong>Inventory</strong> menu at the top.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filteredProducts.map((product) => {
              const isExactMatch =
                detectedUnitPrice !== null && Math.abs(product.price - detectedUnitPrice) < 0.005;
              const effectivePrice =
                detectedUnitPrice !== null ? detectedUnitPrice : product.price;
              const discountedPrice = effectivePrice * 0.5;
              return (
                <div
                  key={product.id}
                  onClick={() => {
                    playScanBeep();
                    onAddToCart({ ...product, price: effectivePrice });
                  }}
                  className={`bg-[#2b2b40] hover:bg-[#35354e] border rounded-xl p-3 flex flex-col justify-between text-left cursor-pointer transition-all duration-150 transform hover:-translate-y-0.5 active:scale-95 shadow-md relative group select-none ${
                    isExactMatch
                      ? 'border-[#00d2d3] ring-2 ring-[#00d2d3] bg-[#00d2d3]/10 shadow-lg shadow-[#00d2d3]/20'
                      : detectedUnitPrice !== null
                      ? 'border-[#00d2d3]/80 ring-1 ring-[#00d2d3]/50'
                      : 'border-[#3f3f5a] hover:border-[#00d2d3]'
                  }`}
                >
                  {/* Top tags */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{product.icon || '💌'}</span>
                    <div className="flex items-center gap-1">
                      {isExactMatch && (
                        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#00d2d3] text-gray-950 shadow-xs">
                          SAME PRICE
                        </span>
                      )}
                      {product.code && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#1e1e2d] text-gray-300 border border-[#3f3f5a]">
                          {product.code}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Category */}
                  <div className="mb-2">
                    <h4 className="font-bold text-white text-xs leading-snug line-clamp-2">
                      {product.name}
                    </h4>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                      {product.category}
                    </span>
                  </div>

                  {/* Pricing info */}
                  <div className="pt-2 border-t border-[#3f3f5a]/50 flex items-end justify-between">
                    <div>
                      {is50Active ? (
                        <div>
                          <span className="text-[10px] text-gray-400 line-through mr-1 font-mono">
                            ${effectivePrice.toFixed(2)}
                          </span>
                          <span className="text-sm font-extrabold text-[#ee5253] font-mono">
                            ${discountedPrice.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm font-extrabold text-[#00d2d3] font-mono">
                          ${effectivePrice.toFixed(2)}
                        </span>
                      )}

                      {detectedUnitPrice !== null && (
                        <span className="text-[9px] text-[#ff9f43] font-bold block leading-tight">
                          {isExactMatch ? '(Exact Price Match)' : '(Numpad Unit Price)'}
                        </span>
                      )}
                    </div>

                    {is50Active && (
                      <span className="bg-[#ee5253] text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                        -50%
                      </span>
                    )}
                  </div>

                  {/* Barcode hint on hover */}
                  <div className="absolute inset-x-0 bottom-0 py-0.5 bg-[#1b1b28]/90 text-[9px] font-mono text-center text-gray-400 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    #{product.barcode}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
