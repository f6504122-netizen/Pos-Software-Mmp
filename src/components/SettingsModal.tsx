import React, { useState } from 'react';
import {
  Settings,
  X,
  User,
  Users,
  Store,
  Trash2,
  AlertTriangle,
  Check,
  Plus,
  Shield,
  KeyRound,
  RotateCcw,
  Sparkles,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { CashierProfile, StoreProfile, ReceiptSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  storeProfile: StoreProfile;
  cashiers: CashierProfile[];
  activeCashier: string;
  receiptSettings: ReceiptSettings;
  productCount: number;
  orderCount: number;
  zReportCount: number;
  onClose: () => void;
  onUpdateStoreProfile: (profile: StoreProfile) => void;
  onUpdateCashiers: (cashiers: CashierProfile[]) => void;
  onSetActiveCashier: (name: string) => void;
  onUpdateReceiptSettings: (settings: ReceiptSettings) => void;
  onFullSoftwareFormat: () => void;
  onFormatInventoryOnly: () => void;
  onFormatSalesOnly: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  storeProfile,
  cashiers,
  activeCashier,
  receiptSettings,
  productCount,
  orderCount,
  zReportCount,
  onClose,
  onUpdateStoreProfile,
  onUpdateCashiers,
  onSetActiveCashier,
  onUpdateReceiptSettings,
  onFullSoftwareFormat,
  onFormatInventoryOnly,
  onFormatSalesOnly,
}) => {
  const [activeTab, setActiveTab] = useState<'store' | 'cashiers' | 'format'>('store');

  // Store profile form
  const [storeForm, setStoreForm] = useState<StoreProfile>({ ...storeProfile });
  const [storeSaved, setStoreSaved] = useState(false);

  // New cashier form
  const [newCashierName, setNewCashierName] = useState('');
  const [newCashierRole, setNewCashierRole] = useState<'Cashier' | 'Manager' | 'Store Owner'>('Cashier');
  const [newCashierPin, setNewCashierPin] = useState('');
  const [showAddCashier, setShowAddCashier] = useState(false);

  // Format confirmation state
  const [formatConfirmText, setFormatConfirmText] = useState('');
  const [formatActionType, setFormatActionType] = useState<'full' | 'inventory' | 'sales' | null>(null);

  if (!isOpen) return null;

  const handleSaveStoreProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStoreProfile(storeForm);
    // Also sync storeName and taxId to receipt settings
    onUpdateReceiptSettings({
      ...receiptSettings,
      storeName: storeForm.storeName,
      tagline: storeForm.tagline,
      address: storeForm.address,
      phone: storeForm.phone,
      taxId: storeForm.taxId,
    });
    setStoreSaved(true);
    setTimeout(() => setStoreSaved(false), 2000);
  };

  const handleCreateCashier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCashierName.trim()) return;

    const newProfile: CashierProfile = {
      id: `cashier-${Date.now()}`,
      name: newCashierName.trim(),
      role: newCashierRole,
      pin: newCashierPin.trim() || undefined,
      active: true,
      color: newCashierRole === 'Store Owner' ? '#f59e0b' : newCashierRole === 'Manager' ? '#8b5cf6' : '#10b981',
    };

    const updated = [...cashiers, newProfile];
    onUpdateCashiers(updated);
    setNewCashierName('');
    setNewCashierPin('');
    setShowAddCashier(false);
  };

  const handleDeleteCashier = (id: string) => {
    if (cashiers.length <= 1) {
      alert('You must keep at least one active cashier profile.');
      return;
    }
    const updated = cashiers.filter((c) => c.id !== id);
    onUpdateCashiers(updated);
  };

  const handleExecuteFormat = () => {
    if (formatConfirmText !== 'FORMAT') {
      alert('Please type the word FORMAT in all caps to confirm.');
      return;
    }

    if (formatActionType === 'full') {
      onFullSoftwareFormat();
    } else if (formatActionType === 'inventory') {
      onFormatInventoryOnly();
    } else if (formatActionType === 'sales') {
      onFormatSalesOnly();
    }

    setFormatActionType(null);
    setFormatConfirmText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#252538] border border-[#3f3f5a] rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1b1b28] border-b border-[#3f3f5a]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-[#8b5cf6] flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">System Settings &amp; Store Setup</h3>
              <p className="text-xs text-gray-400">Store Profile, Staff Accounts &amp; Software Formatting</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-[#2b2b40] p-1 rounded-lg border border-[#3f3f5a] gap-1">
              <button
                onClick={() => setActiveTab('store')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === 'store'
                    ? 'bg-[#8b5cf6] text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Store Profile</span>
              </button>

              <button
                onClick={() => setActiveTab('cashiers')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === 'cashiers'
                    ? 'bg-[#10ac84] text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Staff Profiles</span>
              </button>

              <button
                onClick={() => setActiveTab('format')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === 'format'
                    ? 'bg-[#ee5253] text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Software Format</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#32324d] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: STORE PROFILE */}
          {activeTab === 'store' && (
            <form onSubmit={handleSaveStoreProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    Store / Shop Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={storeForm.storeName}
                    onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                    className="w-full bg-[#1e1e2d] border border-[#3f3f5a] rounded-lg px-3.5 py-2 text-sm text-white font-bold focus:outline-none focus:border-[#8b5cf6]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    Store Tagline / Subtitle
                  </label>
                  <input
                    type="text"
                    value={storeForm.tagline}
                    onChange={(e) => setStoreForm({ ...storeForm, tagline: e.target.value })}
                    className="w-full bg-[#1e1e2d] border border-[#3f3f5a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8b5cf6]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    Owner / Manager Name
                  </label>
                  <input
                    type="text"
                    value={storeForm.ownerName}
                    onChange={(e) => setStoreForm({ ...storeForm, ownerName: e.target.value })}
                    className="w-full bg-[#1e1e2d] border border-[#3f3f5a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8b5cf6]"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    Store Physical Address
                  </label>
                  <input
                    type="text"
                    value={storeForm.address}
                    onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                    className="w-full bg-[#1e1e2d] border border-[#3f3f5a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8b5cf6]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    Store Phone Number
                  </label>
                  <input
                    type="text"
                    value={storeForm.phone}
                    onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                    className="w-full bg-[#1e1e2d] border border-[#3f3f5a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8b5cf6]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    Store Email Address
                  </label>
                  <input
                    type="email"
                    value={storeForm.email}
                    onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
                    className="w-full bg-[#1e1e2d] border border-[#3f3f5a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8b5cf6]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    Tax ID / VAT Registration #
                  </label>
                  <input
                    type="text"
                    value={storeForm.taxId}
                    onChange={(e) => setStoreForm({ ...storeForm, taxId: e.target.value })}
                    className="w-full bg-[#1e1e2d] border border-[#3f3f5a] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#8b5cf6]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    Currency Symbol
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={storeForm.currencySymbol}
                    onChange={(e) => setStoreForm({ ...storeForm, currencySymbol: e.target.value })}
                    className="w-full bg-[#1e1e2d] border border-[#3f3f5a] rounded-lg px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-[#8b5cf6]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow"
                >
                  {storeSaved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
                  <span>{storeSaved ? 'Profile Saved Successfully!' : 'Save Store Profile'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: STAFF & CASHIER PROFILES */}
          {activeTab === 'cashiers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">Staff &amp; Cashier Accounts</h4>
                  <p className="text-xs text-gray-400">Switch active register user or add new staff members</p>
                </div>

                <button
                  onClick={() => setShowAddCashier(!showAddCashier)}
                  className="px-3.5 py-1.5 bg-[#10ac84] hover:bg-[#0e9673] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>{showAddCashier ? 'Close' : 'Add Cashier Profile'}</span>
                </button>
              </div>

              {/* Add Cashier Form */}
              {showAddCashier && (
                <form
                  onSubmit={handleCreateCashier}
                  className="bg-[#1e1e2d] border border-[#3f3f5a] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 animate-in slide-in-from-top duration-150"
                >
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                      Staff / Cashier Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Emma Johnson"
                      value={newCashierName}
                      onChange={(e) => setNewCashierName(e.target.value)}
                      className="w-full bg-[#252538] border border-[#3f3f5a] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#10ac84]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">Role</label>
                    <select
                      value={newCashierRole}
                      onChange={(e) => setNewCashierRole(e.target.value as any)}
                      className="w-full bg-[#252538] border border-[#3f3f5a] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#10ac84]"
                    >
                      <option value="Cashier">Cashier</option>
                      <option value="Manager">Manager</option>
                      <option value="Store Owner">Store Owner</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                      PIN Code (Optional)
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      placeholder="e.g. 1234"
                      value={newCashierPin}
                      onChange={(e) => setNewCashierPin(e.target.value)}
                      className="w-full bg-[#252538] border border-[#3f3f5a] rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#10ac84]"
                    />
                  </div>

                  <div className="sm:col-span-4 flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#10ac84] hover:bg-[#0e9673] text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      Save Profile
                    </button>
                  </div>
                </form>
              )}

              {/* Profiles list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cashiers.map((c) => {
                  const isActive = activeCashier === c.name;
                  return (
                    <div
                      key={c.id}
                      className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                        isActive
                          ? 'bg-[#2b2b44] border-[#10ac84] shadow-md ring-1 ring-[#10ac84]'
                          : 'bg-[#1e1e2d] border-[#3f3f5a]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm"
                          style={{ backgroundColor: c.color || '#3b82f6' }}
                        >
                          {c.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-white text-sm block">{c.name}</span>
                          <span className="text-[11px] text-gray-400 flex items-center gap-1">
                            <Shield className="w-3 h-3 text-[#ff9f43]" />
                            {c.role}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isActive ? (
                          <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-500 rounded-md text-[10px] font-bold">
                            Active Till
                          </span>
                        ) : (
                          <button
                            onClick={() => onSetActiveCashier(c.name)}
                            className="px-2.5 py-1 bg-[#32324d] hover:bg-[#3f3f5a] text-gray-200 rounded-md text-[11px] font-semibold transition-colors"
                          >
                            Switch To
                          </button>
                        )}

                        {cashiers.length > 1 && (
                          <button
                            onClick={() => handleDeleteCashier(c.id)}
                            className="p-1 text-gray-500 hover:text-red-400 rounded hover:bg-[#32324d] transition-colors"
                            title="Delete profile"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: SOFTWARE FORMAT FOR NEW USER */}
          {activeTab === 'format' && (
            <div className="space-y-5">
              <div className="bg-red-950/40 border border-red-500/40 p-4 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-[#ee5253] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#ee5253] text-sm">
                    Software Format &amp; Clean Deployment for New User
                  </h4>
                  <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                    This section prepares the software for a brand-new store or client. You can completely format all local records (inventory, orders, shifts, and drawer history) to hand over a factory-clean POS system.
                  </p>
                </div>
              </div>

              {/* Current database status */}
              <div className="bg-[#1e1e2d] border border-[#3f3f5a] rounded-xl p-4 grid grid-cols-3 gap-3 text-center">
                <div>
                  <span className="text-xs text-gray-400 font-semibold block">Inventory</span>
                  <span className="text-2xl font-bold font-mono text-white">{productCount}</span>
                  <span className="text-[10px] text-gray-500 block">Product items</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-semibold block">Sales Records</span>
                  <span className="text-2xl font-bold font-mono text-[#10ac84]">{orderCount}</span>
                  <span className="text-[10px] text-gray-500 block">Completed orders</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-semibold block">Z-Reports</span>
                  <span className="text-2xl font-bold font-mono text-[#ff9f43]">{zReportCount}</span>
                  <span className="text-[10px] text-gray-500 block">Daily shift closes</span>
                </div>
              </div>

              {/* Format options */}
              <div className="space-y-3">
                {/* 1. Full Format */}
                <div className="bg-[#1e1e2d] border border-[#3f3f5a] p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <strong className="text-white text-xs block">
                      Full Factory Software Format (Clean Install State)
                    </strong>
                    <span className="text-[11px] text-gray-400">
                      Wipes all products, sales history, shifts, and restores the software for a new customer.
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setFormatActionType('full');
                      setFormatConfirmText('');
                    }}
                    className="px-4 py-2 bg-[#ee5253] hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-colors shadow shrink-0 ml-3"
                  >
                    Format Everything
                  </button>
                </div>

                {/* 2. Format Sales only */}
                <div className="bg-[#1e1e2d] border border-[#3f3f5a] p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <strong className="text-white text-xs block">
                      Format Sales &amp; Shift Records Only
                    </strong>
                    <span className="text-[11px] text-gray-400">
                      Clears past orders and Z-reports for opening day, keeping your product catalog intact.
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setFormatActionType('sales');
                      setFormatConfirmText('');
                    }}
                    className="px-4 py-2 bg-[#ff9f43] hover:bg-[#f39c12] text-gray-950 rounded-lg text-xs font-bold transition-colors shadow shrink-0 ml-3"
                  >
                    Clear Sales Logs
                  </button>
                </div>

                {/* 3. Format Inventory only */}
                <div className="bg-[#1e1e2d] border border-[#3f3f5a] p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <strong className="text-white text-xs block">
                      Format Inventory Only
                    </strong>
                    <span className="text-[11px] text-gray-400">
                      Clears all product cards and rack tiers to import a fresh CSV file.
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setFormatActionType('inventory');
                      setFormatConfirmText('');
                    }}
                    className="px-4 py-2 bg-[#32324d] hover:bg-[#3f3f5a] text-gray-200 border border-[#3f3f5a] rounded-lg text-xs font-bold transition-colors shrink-0 ml-3"
                  >
                    Wipe Inventory
                  </button>
                </div>
              </div>

              {/* Confirmation Popup Modal for Software Formatting */}
              {formatActionType && (
                <div className="p-4 bg-red-950/80 border border-red-500 rounded-xl space-y-3 animate-in zoom-in-95">
                  <div className="flex items-center gap-2 text-red-300 font-bold text-sm">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <span>
                      {formatActionType === 'full'
                        ? 'Confirm Full Software Factory Format?'
                        : formatActionType === 'sales'
                        ? 'Confirm Clear All Sales Records?'
                        : 'Confirm Clear All Inventory?'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-200">
                    To confirm this action, please type the word <strong className="text-red-400 font-mono">FORMAT</strong> below:
                  </p>
                  <input
                    type="text"
                    autoFocus
                    placeholder="Type FORMAT"
                    value={formatConfirmText}
                    onChange={(e) => setFormatConfirmText(e.target.value)}
                    className="w-full bg-[#1b1b28] border border-red-500 rounded-lg px-3 py-2 text-white font-mono font-bold text-xs uppercase"
                  />
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setFormatActionType(null)}
                      className="flex-1 py-2 bg-[#32324d] hover:bg-[#3f3f5a] text-white rounded-lg text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={formatConfirmText !== 'FORMAT'}
                      onClick={handleExecuteFormat}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors shadow ${
                        formatConfirmText === 'FORMAT'
                          ? 'bg-[#ee5253] hover:bg-red-600 text-white cursor-pointer'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-50'
                      }`}
                    >
                      Execute Format
                    </button>
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
