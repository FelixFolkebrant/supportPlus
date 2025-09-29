import { app, shell, BrowserWindow, ipcMain, dialog, screen } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import './google/auth'
import { getEmails } from './google/getEmails'
import { getFilteredEmails } from './google/getFilteredEmails'
import { getUnansweredEmails, getUnansweredEmailsCount } from './google/getUnansweredEmails'
import { getRepliedEmails, getRepliedEmailsCount } from './google/getRepliedEmails'
import { getArchivedEmails, getArchivedEmailsCount } from './google/getArchivedEmails'
import { getGmailClient, hasValidToken, logout as gmailLogout, sendReply } from './google/auth'
import { getUserProfile } from './google/getUserProfile'
import { archiveThread, unarchiveThread } from './google/archiveThread'
import { setupDriveHandlers } from './google/drive'

import { autoUpdater } from 'electron-updater'
import log from 'electron-log'

// Setup logging
autoUpdater.logger = log
// Type assertion needed to access transports property not in public API
interface LoggerWithTransports {
  transports: {
    file: {
      level: string
    }
  }
}
;(autoUpdater.logger as unknown as LoggerWithTransports).transports.file.level = 'info'

// Check for updates only when app is packaged

// Store for zoom level
let currentZoomFactor = 1.0
let mainWindow: BrowserWindow | null = null

// Load saved zoom level from storage
function loadSavedZoomFactor(): number {
  try {
    const userDataPath = app.getPath('userData')
    const settingsPath = join(userDataPath, 'settings.json')

    if (existsSync(settingsPath)) {
      const settings = JSON.parse(readFileSync(settingsPath, 'utf-8')) as { zoomFactor?: number }
      return settings.zoomFactor || calculateOptimalZoom()
    }
  } catch (error) {
    console.error('Failed to load zoom factor:', error)
  }

  return calculateOptimalZoom()
}

// Save zoom level to storage
function saveZoomFactor(factor: number): void {
  try {
    const userDataPath = app.getPath('userData')
    const settingsPath = join(userDataPath, 'settings.json')

    let settings: { zoomFactor?: number } = {}
    if (existsSync(settingsPath)) {
      settings = JSON.parse(readFileSync(settingsPath, 'utf-8')) as { zoomFactor?: number }
    }

    settings.zoomFactor = factor
    writeFileSync(settingsPath, JSON.stringify(settings, null, 2))
  } catch (error) {
    console.error('Failed to save zoom factor:', error)
  }
}

// Calculate optimal zoom factor based on display
function calculateOptimalZoom(): number {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { scaleFactor, workAreaSize } = primaryDisplay

  // For high-DPI displays (2.4K+), we want to increase zoom
  if (workAreaSize.width >= 2560) {
    return Math.max(1.0, scaleFactor * 0.8) // Slightly less than full scale factor
  } else if (workAreaSize.width >= 1920) {
    return Math.max(1.0, scaleFactor * 0.9)
  }

  return scaleFactor
}

// Gmail and other existing IPC handlers
ipcMain.handle('gmail:getMails', async (_event, args) => {
  return await getEmails(args)
})

ipcMain.handle('gmail:getFilteredMails', async (_event, args) => {
  return await getFilteredEmails(args)
})

ipcMain.handle('gmail:getUnansweredMails', async (_event, args) => {
  return await getUnansweredEmails(args)
})

ipcMain.handle('gmail:getUnansweredMailsCount', async (_event, args) => {
  return await getUnansweredEmailsCount(args)
})

ipcMain.handle('gmail:getRepliedMails', async (_event, args) => {
  return await getRepliedEmails(args)
})

ipcMain.handle('gmail:getRepliedMailsCount', async (_event, args) => {
  return await getRepliedEmailsCount(args)
})

ipcMain.handle('gmail:getArchivedMails', async (_event, args) => {
  return await getArchivedEmails(args)
})

ipcMain.handle('gmail:getArchivedMailsCount', async () => {
  return await getArchivedEmailsCount()
})

ipcMain.handle('gmail:archiveThread', async (_event, threadId: string) => {
  return await archiveThread(threadId)
})

ipcMain.handle('gmail:unarchiveThread', async (_event, threadId: string) => {
  return await unarchiveThread(threadId)
})

ipcMain.handle('gmail:login', async () => {
  await getGmailClient()
  return true
})

ipcMain.handle('gmail:hasValidToken', async () => {
  return await hasValidToken()
})

ipcMain.handle('gmail:logout', async () => {
  await gmailLogout()
  return true
})

ipcMain.handle('gmail:getUserProfile', async () => {
  return await getUserProfile()
})

ipcMain.handle('gmail:sendReply', async (_event, { messageId, body }) => {
  return await sendReply(messageId, body)
})

// Mark a message as read by removing the UNREAD label
ipcMain.handle('gmail:markAsRead', async (_event, id: string) => {
  const gmail = await getGmailClient()

  // Try to resolve a threadId from a messageId; if that fails, assume id is a threadId
  let threadId = id
  try {
    const msg = await gmail.users.messages.get({ userId: 'me', id })
    if (msg.data.threadId) threadId = msg.data.threadId
  } catch {
    // id might already be a threadId; continue
  }

  // Mark the entire thread as read (remove UNREAD from all messages in the thread)
  await gmail.users.threads.modify({
    userId: 'me',
    id: threadId,
    requestBody: { removeLabelIds: ['UNREAD'] }
  })
  return true
})

ipcMain.on('window:minimize', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender)
  window?.minimize()
})
ipcMain.on('window:maximize', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender)
  if (window?.isMaximized()) {
    window.unmaximize()
  } else {
    window?.maximize()
  }
})
ipcMain.on('window:close', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender)
  window?.close()
})

// Add zoom-related IPC handlers
ipcMain.handle('zoom:get', () => {
  return currentZoomFactor
})

ipcMain.handle('zoom:set', (_, factor: number) => {
  currentZoomFactor = Math.max(0.5, Math.min(3.0, factor)) // Clamp between 0.5x and 3.0x
  if (mainWindow) {
    mainWindow.webContents.setZoomFactor(currentZoomFactor)
  }
  saveZoomFactor(currentZoomFactor)
  return currentZoomFactor
})

ipcMain.handle('zoom:reset', () => {
  currentZoomFactor = calculateOptimalZoom()
  if (mainWindow) {
    mainWindow.webContents.setZoomFactor(currentZoomFactor)
  }
  saveZoomFactor(currentZoomFactor)
  return currentZoomFactor
})

ipcMain.handle('zoom:in', () => {
  currentZoomFactor = Math.min(3.0, currentZoomFactor + 0.1)
  if (mainWindow) {
    mainWindow.webContents.setZoomFactor(currentZoomFactor)
  }
  saveZoomFactor(currentZoomFactor)
  return currentZoomFactor
})

ipcMain.handle('zoom:out', () => {
  currentZoomFactor = Math.max(0.5, currentZoomFactor - 0.1)
  if (mainWindow) {
    mainWindow.webContents.setZoomFactor(currentZoomFactor)
  }
  saveZoomFactor(currentZoomFactor)
  return currentZoomFactor
})

function createWindow(): void {
  // Calculate optimal zoom for the current display or load saved value
  currentZoomFactor = loadSavedZoomFactor()

  // Create the browser window.
  mainWindow = new BrowserWindow({
    show: false,
    autoHideMenuBar: true,
    resizable: true, // Allow window to be resizable
    fullscreenable: true, // Allow fullscreen mode
    fullscreen: false, // Not true, so not native fullscreen
    frame: false, // Show window frame like a normal browser
    width: 1280, // Typical browser window size
    height: 800,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true // Enable context isolation for security
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.maximize() // Maximize to fill the screen but keep window frame
    mainWindow?.show()

    // Apply initial zoom factor
    if (mainWindow) {
      mainWindow.webContents.setZoomFactor(currentZoomFactor)
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Setup Drive handlers
  setupDriveHandlers()

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  if (!is.dev) {
    autoUpdater.checkForUpdatesAndNotify()

    autoUpdater.on('update-downloaded', () => {
      const result = dialog.showMessageBoxSync({
        type: 'info',
        buttons: ['Restart Now', 'Later'],
        defaultId: 0,
        message:
          'A new update has been downloaded. Would you like to restart the app to apply it now?'
      })

      if (result === 0) {
        autoUpdater.quitAndInstall()
      }
    })
  }
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
