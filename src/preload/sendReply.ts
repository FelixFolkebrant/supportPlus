// Add this to your preload script (typically src/preload/index.ts)
import { contextBridge, ipcRenderer } from 'electron'

// Add sendReply to the electronAPI object
const electronAPI = {
  // ...existing methods...
  sendReply: (data: {
    threadId: string
    messageId: string
    to: string
    subject: string
    body: string
  }) => ipcRenderer.invoke('send-reply', data)
}

contextBridge.exposeInMainWorld('electron', electronAPI)