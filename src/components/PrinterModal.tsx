import React, { useState, useEffect } from 'react';
import {
  Printer,
  X,
  RefreshCw,
  Check,
  CheckCircle2,
  DollarSign,
  Sliders,
  Sparkles,
  Wifi,
} from 'lucide-react';
import {
  DetectedPrinter,
  PrinterSettings,
  getAvailablePrinters,
  printReceiptDocument,
  triggerCashDrawerKick,
} from '../utils/printerService';
import { playCashRegisterDing } from '../utils/audio';

interface PrinterModalProps {
  isOpen: boolean;
  settings: PrinterSettings;
  onClose: () => void;
  onSaveSettings: (settings: PrinterSettings) => void;
  onKickDrawer: () => void;
}

export const PrinterModal: React.FC<PrinterModalProps> = ({
  isOpen,
  settings,
  onClose,
  onSaveSettings,
  onKickDrawer,
}) => {
  const [printers, setPrinters] = useState<DetectedPrinter[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentSettings, setCurrentSettings] = useState<PrinterSettings>({ ...settings });
  const [testStatus, setTestStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      scanPrinters();
    }
  }, [isOpen]);

  const scanPrinters = async () => {
    setLoading(true);
    try {
      const list = await getAvailablePrinters();
      setPrinters(list);
      // If auto-connect is active and no specific printer chosen, pick default
      if (currentSettings.autoConnect && (!currentSettings.selectedPrinter || currentSettings.selectedPrinter === 'auto-windows-default')) {
        const defaultOne = list.find((p) => p.isDefault) || list[0];
        if (defaultOne) {
          setCurrentSettings((prev) => ({ ...prev, selectedPrinter: defaultOne.name }));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleTestPrint = async () => {
    setTestStatus('Printing test ticket...');
    await printReceiptDocument(currentSettings.selectedPrinter, false);
    setTestStatus('Test ticket sent to printer!');
    setTimeout(() => setTestStatus(null), 3000);
  };

  const handleTestDrawer = async () => {
    playCashRegisterDing();
    onKickDrawer();
    setTestStatus('Cash drawer kick pulse sent!');
    setTimeout(() => setTestStatus(null), 2500);
  };

  const handleSave = () => {
    onSaveSettings(currentSettings);
    onClose();
  };

  const activePrinterObj = printers.find((p) => p.name === currentSettings.selectedPrinter) || printers[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#252538] border border-[#3f3f5a] rounded-xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1b1b28] border-b border-[#3f3f5a]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-[#00d2d3] flex items-center justify-center">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Receipt Printer &amp; Cash Drawer</h3>
              <p className="text-xs text-gray-400">Windows automatic printer detection and drawer kick</p>
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
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Active connection banner */}
          <div className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-emerald-400 block">
                  Connected &amp; Ready
                </span>
                <span className="text-sm font-bold text-white">
                  {activePrinterObj ? activePrinterObj.displayName : 'Windows Default Receipt Printer'}
                </span>
              </div>
            </div>

            <button
              onClick={scanPrinters}
              disabled={loading}
              className="px-3 py-1.5 bg-[#32324d] hover:bg-[#3f3f5a] text-gray-200 border border-[#3f3f5a] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Rescan Windows Printers"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#00d2d3]' : ''}`} />
              <span>Rescan</span>
            </button>
          </div>

          {/* Automatic Windows Connect Switch */}
          <div className="bg-[#1e1e2d] p-4 rounded-xl border border-[#3f3f5a] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-xs block">
                  Automatic Windows Printer Detection
                </span>
                <span className="text-[11px] text-gray-400">
                  Automatically connect to default Windows POS printer when application opens
                </span>
              </div>
              <input
                type="checkbox"
                checked={currentSettings.autoConnect}
                onChange={(e) =>
                  setCurrentSettings((prev) => ({ ...prev, autoConnect: e.target.checked }))
                }
                className="w-5 h-5 accent-[#00d2d3] rounded cursor-pointer"
              />
            </div>

            {/* Select Printer */}
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Select Connected Receipt Printer:
              </label>
              <select
                value={currentSettings.selectedPrinter}
                onChange={(e) =>
                  setCurrentSettings((prev) => ({ ...prev, selectedPrinter: e.target.value }))
                }
                className="w-full bg-[#252538] border border-[#3f3f5a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d2d3]"
              >
                {printers.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.displayName} {p.isDefault ? '(Default)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Paper width and options */}
          <div className="bg-[#1e1e2d] p-4 rounded-xl border border-[#3f3f5a] space-y-3">
            <span className="font-bold text-xs uppercase tracking-wider text-gray-300 block">
              POS Printing Automation
            </span>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-semibold text-white block">Auto-Print Receipt on Sale</span>
                  <span className="text-[11px] text-gray-400">
                    Immediately send receipt to thermal printer when checkout finishes
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={currentSettings.autoPrintOnSale}
                  onChange={(e) =>
                    setCurrentSettings((prev) => ({ ...prev, autoPrintOnSale: e.target.checked }))
                  }
                  className="w-4 h-4 accent-[#00d2d3] rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-[#3f3f5a]/50">
                <div>
                  <span className="font-semibold text-white block">Kick Cash Drawer on Cash Sale</span>
                  <span className="text-[11px] text-gray-400">
                    Send drawer open pulse (ESC p 0) automatically when cash sale completes
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={currentSettings.cashDrawerKickOnSale}
                  onChange={(e) =>
                    setCurrentSettings((prev) => ({
                      ...prev,
                      cashDrawerKickOnSale: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 accent-[#10ac84] rounded"
                />
              </label>

              <div className="flex items-center justify-between pt-2 border-t border-[#3f3f5a]/50">
                <span className="font-semibold text-white">Thermal Paper Width</span>
                <div className="flex gap-1.5">
                  {(['80mm', '58mm'] as const).map((width) => (
                    <button
                      key={width}
                      type="button"
                      onClick={() =>
                        setCurrentSettings((prev) => ({ ...prev, paperWidth: width }))
                      }
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                        currentSettings.paperWidth === width
                          ? 'bg-[#00d2d3] text-gray-950 font-black'
                          : 'bg-[#252538] text-gray-300'
                      }`}
                    >
                      {width} Standard
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Test Buttons */}
          <div className="space-y-2">
            <span className="text-xs text-gray-400 font-semibold block">Hardware Testing:</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleTestPrint}
                className="py-2.5 bg-[#32324d] hover:bg-[#3f3f5a] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-[#3f3f5a]"
              >
                <Printer className="w-4 h-4 text-[#00d2d3]" />
                <span>Test Print Receipt</span>
              </button>

              <button
                type="button"
                onClick={handleTestDrawer}
                className="py-2.5 bg-[#32324d] hover:bg-[#3f3f5a] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-[#3f3f5a]"
              >
                <DollarSign className="w-4 h-4 text-[#10ac84]" />
                <span>Test Open Drawer</span>
              </button>
            </div>
            {testStatus && (
              <p className="text-center text-xs text-[#00d2d3] font-bold animate-pulse">
                {testStatus}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#1b1b28] border-t border-[#3f3f5a] flex items-center justify-between">
          <span className="text-[11px] text-gray-400">Settings save to Windows profile</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#32324d] hover:bg-[#3f3f5a] text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-[#10ac84] hover:bg-[#0e9673] text-white rounded-lg text-xs font-bold transition-colors shadow"
            >
              Save Printer Setup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
