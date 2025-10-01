import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  // Zoom controls
  zoom: {
    get: () => ipcRenderer.invoke('zoom:get'),
    set: (factor: number) => ipcRenderer.invoke('zoom:set', factor),
    reset: () => ipcRenderer.invoke('zoom:reset'),
    in: () => ipcRenderer.invoke('zoom:in'),
    out: () => ipcRenderer.invoke('zoom:out')
  },
  gmail: {
    listAccounts: () => ipcRenderer.invoke('gmail:listAccounts') as Promise<string[]>,
    listAccountsWithProfiles: () =>
      ipcRenderer.invoke('gmail:listAccountsWithProfiles') as Promise<
        Array<{ email: string; name: string; picture: string }>
      >,
    getActiveAccount: () => ipcRenderer.invoke('gmail:getActiveAccount') as Promise<string | null>,
    switchAccount: (email: string) => ipcRenderer.invoke('gmail:switchAccount', email),
    addAccount: () =>
      ipcRenderer.invoke('gmail:addAccount') as Promise<{
        email: string
        name: string
        picture: string
      }>,
    removeAccount: (email: string) => ipcRenderer.invoke('gmail:removeAccount', email)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
