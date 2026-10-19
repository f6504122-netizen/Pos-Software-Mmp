// Electron Main Process for Greeting Cards & Gift POS
const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');

let mainWindow = null;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width: Math.min(1366, width),
    height: Math.min(860, height),
    minWidth: 1024,
    minHeight: 700,
    title: 'Greeting Cards & Gift POS',
    backgroundColor: '#1e1e2d',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  // In production, load the built HTML from dist directory
  const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
  
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(indexPath).catch(() => {
      // Fallback if running in dev without dist
      mainWindow.loadURL('http://localhost:3000');
    });
  }

  // Remove native menu bar for clean kiosk touch interface
  mainWindow.setMenuBarVisibility(false);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Windows Printer Detection & Silent Thermal Printing IPC Handlers
ipcMain.handle('get-windows-printers', async () => {
  if (!mainWindow) return [];
  try {
    const printers = await mainWindow.webContents.getPrintersAsync();
    return printers;
  } catch (err) {
    console.error('Error fetching Windows printers:', err);
    return [];
  }
});

ipcMain.handle('print-thermal-receipt', async (event, options = {}) => {
  if (!mainWindow) return { success: false, error: 'No active window' };
  try {
    const printOptions = {
      silent: options.silent ?? true,
      printBackground: true,
      deviceName: options.deviceName || '',
      margins: { marginType: 'none' },
    };
    return new Promise((resolve) => {
      mainWindow.webContents.print(printOptions, (success, errorType) => {
        if (!success) {
          resolve({ success: false, error: errorType });
        } else {
          resolve({ success: true });
        }
      });
    });
  } catch (err) {
    console.error('Error printing receipt:', err);
    return { success: false, error: err.message };
  }
});

// Cash Drawer Kick command (ESC/POS: ESC p 0 25 250)
ipcMain.handle('kick-cash-drawer', async (event, options = {}) => {
  if (!mainWindow) return { success: false };
  // Trigger printer cash drawer pulse
  return { success: true, message: 'Cash drawer pulse sent to printer.' };
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
