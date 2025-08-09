const { app, BrowserWindow, dialog, Tray, Menu, nativeImage, globalShortcut, screen, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let win, tray, editing = false;

function setEditing(flag) {
  editing = !!flag;
  if (!win || win.isDestroyed()) return;
  // When editing: accept clicks + focus so sliders work
  win.setIgnoreMouseEvents(!editing, { forward: true });
  if (win.setFocusable) win.setFocusable(editing);
  if (editing) win.focus();
  win.webContents.send('overlay:editing', editing);
  // Refresh tray menu checkmark
  if (tray) tray.setContextMenu(buildTrayMenu());
}

function buildTrayMenu() {
  return Menu.buildFromTemplate([
    { label: 'Load Image...', click: pickImage },
    {
      label: 'Opacity',
      submenu: [
        { label: '100%', click: () => win.setOpacity(1) },
        { label: '85%',  click: () => win.setOpacity(0.85) },
        { label: '70%',  click: () => win.setOpacity(0.7) },
        { label: '50%',  click: () => win.setOpacity(0.5) }
      ]
    },
    { type: 'separator' },
    { label: 'Edit Overlay', type: 'checkbox', checked: editing, click: (item) => setEditing(item.checked) },
    { label: 'Open DevTools', click: () => win.webContents.openDevTools({ mode: 'detach' }) },
    { label: 'Show/Hide', click: () => win.isVisible() ? win.hide() : win.show() },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ]);
}

function createWindow() {
  win = new BrowserWindow({
    show: false,
    transparent: true,
    frame: false,
    resizable: false,
    focusable: false,                 // passive by default
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: false,
    backgroundColor: '#00000001',     // tiny alpha to force composition
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Passive overlay defaults
  win.setIgnoreMouseEvents(true, { forward: true });
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.setAlwaysOnTop(true, 'screen-saver');

  const setPrimaryBounds = () => {
    const { bounds } = screen.getPrimaryDisplay();
    win.setBounds(bounds);
  };
  setPrimaryBounds();
  screen.on('display-metrics-changed', setPrimaryBounds);
  screen.on('display-added', setPrimaryBounds);
  screen.on('display-removed', setPrimaryBounds);

  win.loadFile('index.html');
  win.setOpacity(0.9);
}

function createTray() {
  const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAIElEQVR42mNgoBvg////Z2BgYGBg2IABg8EwGQ0jEwAAfJsF2v5kqW4AAAAASUVORK5CYII=';
  tray = new Tray(nativeImage.createFromDataURL(dataUrl));
  tray.setToolTip('Passive Overlay');
  tray.setContextMenu(buildTrayMenu());
}

function pickImage() {
  const result = dialog.showOpenDialogSync({
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['png','jpg','jpeg','webp','gif','bmp','tiff','tif'] }]
  });
  if (!result || !result[0]) return;

  const fp = result[0];
  try {
    const buf = fs.readFileSync(fp);
    const ext = (path.extname(fp).toLowerCase().slice(1) || 'png');
    const mime = ({
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
      webp: 'image/webp', gif: 'image/gif', bmp: 'image/bmp',
      tiff: 'image/tiff', tif: 'image/tiff'
    })[ext] || 'image/png';
    const dataUrl = `data:${mime};base64,${buf.toString('base64')}`;
    win.webContents.send('overlay:image-data', dataUrl);
    if (!win.isVisible()) win.show();
  } catch (err) {
    console.error('[main] Failed to read file:', err);
  }
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  globalShortcut.register('Control+Alt+O', pickImage);
  globalShortcut.register('Control+Alt+H', () => win.isVisible() ? win.hide() : win.show());
  globalShortcut.register('Control+Alt+E', () => setEditing(!editing));
  setEditing(false); // start passive
});

ipcMain.on('overlay:requestEditing', (_e, flag) => setEditing(!!flag));

app.on('window-all-closed', (e) => e.preventDefault());
app.on('before-quit', () => globalShortcut.unregisterAll());
