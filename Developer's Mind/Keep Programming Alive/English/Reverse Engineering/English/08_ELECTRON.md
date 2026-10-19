# Electron process boundaries

## Concept

Electron packaging includes main process, renderer, possible preload scripts and assets. ASAR is a container, not by definition encrypted code; static presence does not equal runtime use.

## Without AI: practice

Inspect a self-built Electron demo. Diagram file access in main versus UI updates in renderer, and note IPC or preload boundaries.

## Verify it

Find one resource included in a package but not reached by the demonstrated interaction.

## With AI (optional)

Have AI review a diagram and request source or observed evidence for every edge.

## Practical lab: trace the Electron privilege boundary

Electron applications separate a browser renderer from a privileged main process. A renderer button is not permission to run arbitrary Node code. Inspect only an application you own or have permission to examine.

Build a toy Electron window with context isolation enabled and Node integration disabled. Expose exactly one operation through preload instead of exposing unrestricted ipcRenderer. In your main process, handle only a named channel and return a fixed harmless result.

~~~javascript
// preload.js
const {contextBridge, ipcRenderer} = require('electron');
contextBridge.exposeInMainWorld('demoAPI', {
  readDemoName: () => ipcRenderer.invoke('demo:filename')
});
// main process: register handler after ipcMain is imported
ipcMain.handle('demo:filename', () => 'fixture.txt');
~~~

Draw the path DOM button -> preload -> allowed IPC channel -> main handler -> response. Add a list of which stage can read disk, which arguments can cross, and where untrusted input would need validation. Change the renderer channel to demo:missing: it should fail, not discover a general-purpose file-reading interface. Restore the channel and confirm the expected fixture.txt response.

Observed UI, IPC behavior and source-code inspection answer three different questions. Disabling DevTools is not a substitute for limiting privileges. References: https://www.electronjs.org/docs/latest/tutorial/security.
