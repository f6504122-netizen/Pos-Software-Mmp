import React, { useState, useRef } from 'react';
import {
  Package,
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  Search,
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';
import { Product } from '../types';
import { parseCSV, downloadSampleCSVTemplate, exportProductsToCSV } from '../utils/csvHelper';
import { STANDARD_CARD_RACK_PRESETS } from '../data/initialProducts';

interface InventoryModalProps {
  isOpen: boolean;
  products: Product[];
  onClose: () => void;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onImportProducts: (newProducts: Product[], replace: boolean) => void;
  onClearAllProducts: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  products,
  onClose,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onImportProducts,
  onClearAllProducts,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);

  // New item form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('birthday');
  const [newBarcode, setNewBarcode] = useState('');
  const [newCode, setNewCode] = useState('Tier A');
  const [newStock, setNewStock] = useState('50');

  // Edit item form state
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');

  // CSV Import State
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreviewCount, setCsvPreviewCount] = useState<number | null>(null);
  const [parsedItems, setParsedItems] = useState<Product[]>([]);
  const [csvReplaceMode, setCsvReplaceMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'price-codes', label: 'Price Codes' },
    { id: 'birthday', label: 'Birthday' },
    { id: 'anniversary', label: 'Anniversary' },
    { id: 'sympathy', label: 'Sympathy' },
    { id: 'holiday', label: 'Holiday' },
    { id: 'wrap', label: 'Wrap & Bags' },
    { id: 'plush', label: 'Plush & Toys' },
    { id: 'candles', label: 'Candles' },
    { id: 'novelty', label: 'Novelty' },
  ];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.toLowerCase().includes(search.toLowerCase()) ||
      (p.code && p.code.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(newPrice);
    if (!priceNum || isNaN(priceNum) || priceNum <= 0) return;

    const prod: Product = {
      id: `prod-${Date.now()}`,
      name: newName.trim(),
      price: priceNum,
      category: newCategory,
      barcode: newBarcode.trim() || `88${Math.floor(1000 + Math.random() * 9000)}`,
      code: newCode.trim() || 'Custom',
      stock: parseInt(newStock, 10) || 50,
      icon: '💌',
    };

    onAddProduct(prod);
    setNewName('');
    setNewPrice('');
    setNewBarcode('');
    setShowAddForm(false);
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setEditPrice(p.price.toString());
    setEditStock((p.stock ?? 50).toString());
  };

  const saveEdit = (p: Product) => {
    const priceNum = parseFloat(editPrice);
    const stockNum = parseInt(editStock, 10);
    if (!priceNum || isNaN(priceNum)) return;

    onUpdateProduct({
      ...p,
      price: priceNum,
      stock: isNaN(stockNum) ? 50 : stockNum,
    });
    setEditingId(null);
  };

  // CSV File reading
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const items = parseCSV(text) as Product[];
        setParsedItems(items);
        setCsvPreviewCount(items.length);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    if (parsedItems.length === 0) {
      alert('No valid products found in CSV file.');
      return;
    }
    onImportProducts(parsedItems, csvReplaceMode);
    setShowCSVModal(false);
    setCsvFile(null);
    setParsedItems([]);
    setCsvPreviewCount(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#252538] border border-[#3f3f5a] rounded-xl shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1b1b28] border-b border-[#3f3f5a]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-[#ec4899] flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Greeting Card &amp; Gift Inventory</h3>
              <p className="text-xs text-gray-400">Import CSV, manage retail catalog &amp; rack price tiers</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Import CSV button */}
            <button
              onClick={() => setShowCSVModal(true)}
              className="px-3.5 py-1.5 bg-[#00d2d3] hover:bg-[#00b4b5] text-gray-900 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Import items from CSV file"
            >
              <Upload className="w-4 h-4" />
              <span>Import CSV</span>
            </button>

            {/* Export CSV button */}
            {products.length > 0 && (
              <button
                onClick={() => exportProductsToCSV(products)}
                className="px-3 py-1.5 bg-[#32324d] hover:bg-[#3f3f5a] text-gray-200 border border-[#3f3f5a] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Export catalog to CSV spreadsheet"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            )}

            {/* Add single product */}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3.5 py-1.5 bg-[#10ac84] hover:bg-[#0e9673] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddForm ? 'Close' : 'Add Item'}</span>
            </button>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-[#32324d] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Add Product Collapsible Form */}
        {showAddForm && (
          <form
            onSubmit={handleCreateProduct}
            className="p-4 bg-[#1e1e2d] border-b border-[#3f3f5a] grid grid-cols-2 sm:grid-cols-6 gap-3 animate-in slide-in-from-top duration-150"
          >
            <div className="sm:col-span-2">
              <label className="text-[11px] text-gray-400 font-semibold block mb-1">Item Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Birthday Card A (Floral)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-[#2b2b40] border border-[#3f3f5a] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#10ac84]"
              />
            </div>

            <div>
              <label className="text-[11px] text-gray-400 font-semibold block mb-1">Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="3.99"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-full bg-[#2b2b40] border border-[#3f3f5a] rounded-lg px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-[#10ac84]"
              />
            </div>

            <div>
              <label className="text-[11px] text-gray-400 font-semibold block mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-[#2b2b40] border border-[#3f3f5a] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#10ac84]"
              >
                <option value="birthday">Birthday</option>
                <option value="anniversary">Anniversary</option>
                <option value="sympathy">Sympathy</option>
                <option value="holiday">Holiday</option>
                <option value="wrap">Wrap &amp; Bags</option>
                <option value="plush">Plush</option>
                <option value="candles">Candles</option>
                <option value="novelty">Novelty</option>
                <option value="price-codes">Price Codes</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-gray-400 font-semibold block mb-1">Barcode / SKU</label>
              <input
                type="text"
                placeholder="880101"
                value={newBarcode}
                onChange={(e) => setNewBarcode(e.target.value)}
                className="w-full bg-[#2b2b40] border border-[#3f3f5a] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#10ac84]"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-1.5 bg-[#10ac84] hover:bg-[#0e9673] text-white rounded-lg text-xs font-bold transition-colors"
              >
                Save Item
              </button>
            </div>
          </form>
        )}

        {/* Filters and search */}
        <div className="px-6 py-3 bg-[#1e1e2d] border-b border-[#3f3f5a] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by title, barcode SKU, or rack tier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#2b2b40] border border-[#3f3f5a] rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00d2d3] w-full"
            />
          </div>

          <div className="flex gap-1 overflow-x-auto max-w-full py-0.5">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === c.id
                    ? 'bg-[#00d2d3] text-gray-900 font-bold'
                    : 'bg-[#2b2b40] text-gray-300 hover:text-white'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Table */}
        <div className="p-6 overflow-y-auto flex-1">
          {products.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-[#3f3f5a] rounded-xl p-8">
              <div className="w-14 h-14 rounded-2xl bg-[#1e1e2d] border border-[#3f3f5a] flex items-center justify-center mx-auto mb-3 text-[#00d2d3]">
                <FileSpreadsheet className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-white text-base">Clean Software - No Products Yet</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                Your inventory is ready for your cards and gifts. You can import products from a CSV file, add items manually, or add standard Card Rack Tiers.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
                <button
                  onClick={() => setShowCSVModal(true)}
                  className="px-4 py-2 bg-[#00d2d3] hover:bg-[#00b4b5] text-gray-900 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow"
                >
                  <Upload className="w-4 h-4" />
                  <span>Import Products From CSV</span>
                </button>

                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 bg-[#10ac84] hover:bg-[#0e9673] text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Item</span>
                </button>

                <button
                  onClick={() => onImportProducts(STANDARD_CARD_RACK_PRESETS, false)}
                  className="px-4 py-2 bg-[#32324d] hover:bg-[#3f3f5a] text-gray-200 border border-[#3f3f5a] rounded-lg text-xs font-semibold flex items-center gap-2 transition-all"
                >
                  <span>Load Standard Card Rack Tiers (A-F)</span>
                </button>
              </div>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1b1b28] text-gray-400 uppercase border-b border-[#3f3f5a]">
                <tr>
                  <th className="p-2.5">Item Name</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Barcode / SKU</th>
                  <th className="p-2.5">Rack Code</th>
                  <th className="p-2.5">Price</th>
                  <th className="p-2.5">Stock</th>
                  <th className="p-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3f3f5a]/50">
                {filteredProducts.map((p) => {
                  const isEditing = editingId === p.id;
                  return (
                    <tr key={p.id} className="hover:bg-[#32324d]/30 transition-colors">
                      <td className="p-2.5 font-medium text-white flex items-center gap-2">
                        <span className="text-base">{p.icon || '💌'}</span>
                        <span>{p.name}</span>
                      </td>
                      <td className="p-2.5 uppercase text-[10px] text-gray-400 font-semibold">
                        {p.category}
                      </td>
                      <td className="p-2.5 font-mono text-gray-300">{p.barcode}</td>
                      <td className="p-2.5">
                        {p.code && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#32324d] text-gray-200 font-semibold border border-[#3f3f5a]">
                            {p.code}
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 font-bold text-[#00d2d3]">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-16 bg-[#1b1b28] border border-[#00d2d3] rounded px-1 py-0.5 text-white"
                          />
                        ) : (
                          `$${p.price.toFixed(2)}`
                        )}
                      </td>
                      <td className="p-2.5 text-gray-300">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editStock}
                            onChange={(e) => setEditStock(e.target.value)}
                            className="w-14 bg-[#1b1b28] border border-[#00d2d3] rounded px-1 py-0.5 text-white"
                          />
                        ) : (
                          `${p.stock ?? 50} in stock`
                        )}
                      </td>
                      <td className="p-2.5 text-right space-x-1">
                        {isEditing ? (
                          <button
                            onClick={() => saveEdit(p)}
                            className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors"
                            title="Save"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => startEdit(p)}
                            className="p-1 bg-[#32324d] hover:bg-[#3f3f5a] text-gray-300 hover:text-white rounded transition-colors"
                            title="Edit Price/Stock"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${p.name}" from catalog?`)) {
                              onDeleteProduct(p.id);
                            }
                          }}
                          className="p-1 bg-red-950/60 hover:bg-red-900 text-red-300 rounded transition-colors"
                          title="Delete Product"
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

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#1b1b28] border-t border-[#3f3f5a] flex items-center justify-between text-xs text-gray-400">
          <span>{filteredProducts.length} item(s) listed</span>

          <div className="flex items-center gap-3">
            {products.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Clear ALL products to make software completely empty?')) {
                    onClearAllProducts();
                  }
                }}
                className="flex items-center gap-1.5 text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Products</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CSV Import Modal */}
      {showCSVModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#252538] border border-[#3f3f5a] rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#1b1b28] border-b border-[#3f3f5a]">
              <div className="flex items-center gap-2 text-[#00d2d3] font-bold text-sm">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Import Products CSV File</span>
              </div>
              <button
                onClick={() => setShowCSVModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded hover:bg-[#32324d]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="text-xs text-gray-300 space-y-1">
                <p>
                  Upload a spreadsheet CSV file with columns: <strong>Name, Price, Category, Barcode, Code, Stock</strong>.
                </p>
                <p className="text-gray-400">
                  You can download our pre-formatted template, fill it in Excel or Google Sheets, and import it here.
                </p>
              </div>

              {/* Sample Template Download */}
              <div className="bg-[#1e1e2d] p-3 rounded-lg border border-[#3f3f5a] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">CSV Template</span>
                  <span className="text-[10px] text-gray-400">Standard card shop columns</span>
                </div>
                <button
                  type="button"
                  onClick={downloadSampleCSVTemplate}
                  className="px-3 py-1.5 bg-[#32324d] hover:bg-[#3f3f5a] text-[#00d2d3] rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample</span>
                </button>
              </div>

              {/* File upload zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#3f3f5a] hover:border-[#00d2d3] rounded-xl p-6 text-center cursor-pointer bg-[#1e1e2d]/60 hover:bg-[#1e1e2d] transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-[#00d2d3] mx-auto mb-2" />
                <span className="text-xs font-bold text-white block">
                  {csvFile ? csvFile.name : 'Click to select CSV file from your computer'}
                </span>
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Supports comma-delimited (.csv) files
                </span>
              </div>

              {/* Parse preview */}
              {csvPreviewCount !== null && (
                <div className="bg-emerald-950/40 border border-emerald-500/40 p-3 rounded-lg text-emerald-300 text-xs flex items-center justify-between">
                  <span className="font-semibold">
                    ✓ Found {csvPreviewCount} product(s) ready to import
                  </span>
                </div>
              )}

              {/* Import options */}
              <div className="bg-[#1e1e2d] p-3 rounded-lg border border-[#3f3f5a] space-y-2 text-xs">
                <span className="font-bold text-gray-300 block">Import Mode:</span>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={!csvReplaceMode}
                      onChange={() => setCsvReplaceMode(false)}
                      className="accent-[#00d2d3]"
                    />
                    <span>Append to existing products</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={csvReplaceMode}
                      onChange={() => setCsvReplaceMode(true)}
                      className="accent-[#ee5253]"
                    />
                    <span className="text-[#ee5253]">Replace current catalog entirely</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCSVModal(false)}
                  className="flex-1 py-2.5 bg-[#32324d] hover:bg-[#3f3f5a] text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!csvFile || parsedItems.length === 0}
                  onClick={handleExecuteImport}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    csvFile && parsedItems.length > 0
                      ? 'bg-[#00d2d3] hover:bg-[#00b4b5] text-gray-900 cursor-pointer shadow-md'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Import {parsedItems.length > 0 ? `${parsedItems.length} Items` : ''}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
