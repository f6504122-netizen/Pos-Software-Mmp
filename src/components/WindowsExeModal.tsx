import React, { useState } from 'react';
import { Monitor, X, Download, Terminal, CheckCircle2, Copy, Check, ShieldCheck } from 'lucide-react';

interface WindowsExeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WindowsExeModal: React.FC<WindowsExeModalProps> = ({ isOpen, onClose }) => {
  const [copiedScript, setCopiedScript] = useState(false);

  if (!isOpen) return null;

  const buildCommand = 'npm run build:exe';

  const batchFileContent = `@echo off
echo ===================================================
echo   Greeting Cards & Gift POS - Windows EXE Builder
echo ===================================================
echo.
echo [1/3] Installing dependencies...
call npm install
echo.
echo [2/3] Building production web assets with Vite...
call npm run build
echo.
echo [3/3] Packaging into Windows NSIS EXE with Electron Builder...
call npx electron-builder --win nsis
echo.
echo ===================================================
echo   Build Complete!
echo   Your Windows installer is in the "dist-exe" folder:
echo   GreetingCardsPOS-Setup.exe
echo ===================================================
pause`;

  const handleDownloadBatch = () => {
    const blob = new Blob([batchFileContent], { type: 'application/x-bat' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'build-windows-exe.bat';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(buildCommand);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#252538] border border-[#3f3f5a] rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1b1b28] border-b border-[#3f3f5a]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-[#00d2d3] flex items-center justify-center">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Windows Standalone Desktop (.EXE)</h3>
              <p className="text-xs text-gray-400">Package POS into a native Windows executable and installer</p>
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
          {/* Status badge */}
          <div className="bg-blue-950/40 border border-blue-500/40 p-4 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#00d2d3] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-[#00d2d3] text-sm">Windows Electron &amp; NSIS Configured</h4>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                The repository is fully configured with an Electron main process (<code>electron/main.cjs</code>), automatic kiosk sizing, window menu suppression, and the <code>electron-builder</code> Windows NSIS installer recipe in <code>package.json</code>.
              </p>
            </div>
          </div>

          {/* Quick steps */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-300">
              How to Generate Your Windows .EXE File:
            </h4>

            <div className="space-y-2.5 text-xs text-gray-300">
              <div className="flex items-start gap-2.5 bg-[#1e1e2d] p-3 rounded-lg border border-[#3f3f5a]">
                <span className="w-5 h-5 rounded-full bg-[#00d2d3] text-gray-950 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <div>
                  <strong className="text-white block mb-0.5">Run the build command on Windows:</strong>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-[#12121a] px-3 py-1.5 rounded font-mono text-[#00d2d3] text-xs border border-[#3f3f5a]">
                      npm run build:exe
                    </code>
                    <button
                      onClick={handleCopyCommand}
                      className="px-2.5 py-1.5 bg-[#32324d] hover:bg-[#3f3f5a] text-gray-200 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                    >
                      {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedScript ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-[#1e1e2d] p-3 rounded-lg border border-[#3f3f5a]">
                <span className="w-5 h-5 rounded-full bg-[#00d2d3] text-gray-950 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <div>
                  <strong className="text-white block mb-0.5">Locate your installer:</strong>
                  <p className="text-gray-400">
                    The build system will create an executable installer at:
                    <br />
                    <code className="text-[#ff9f43] font-mono">dist-exe\Greeting Cards &amp; Gift POS Setup 1.0.0.exe</code>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-[#1e1e2d] p-3 rounded-lg border border-[#3f3f5a]">
                <span className="w-5 h-5 rounded-full bg-[#00d2d3] text-gray-950 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <div>
                  <strong className="text-white block mb-0.5">Install &amp; run offline:</strong>
                  <p className="text-gray-400">
                    Double-click the installer on any Windows 10/11 POS terminal or PC. It creates a desktop shortcut, runs 100% offline, connects to USB barcode scanners, and connects to receipt printers.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Download 1-click batch file */}
          <div className="bg-[#1e1e2d] p-4 rounded-xl border border-[#3f3f5a] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Terminal className="w-5 h-5 text-[#ff9f43]" />
              <div>
                <span className="font-bold text-white text-xs block">One-Click Build Script</span>
                <span className="text-[11px] text-gray-400">
                  Download <code>build-windows-exe.bat</code> to build with 1 double-click
                </span>
              </div>
            </div>

            <button
              onClick={handleDownloadBatch}
              className="px-4 py-2 bg-[#ff9f43] hover:bg-[#f39c12] text-gray-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow"
            >
              <Download className="w-4 h-4" />
              <span>Download .BAT</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#1b1b28] border-t border-[#3f3f5a] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#10ac84] hover:bg-[#0e9673] text-white rounded-lg text-xs font-bold transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
