const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('overlayAPI', {
  // image
  onImageData: (cb) => ipcRenderer.on('overlay:image-data', (_evt, dataUrl) => cb(dataUrl)),

  // edit mode
  setEditing: (flag) => ipcRenderer.send('overlay:requestEditing', !!flag),
  onEditing: (cb) => ipcRenderer.on('overlay:editing', (_evt, flag) => cb(!!flag))
});
