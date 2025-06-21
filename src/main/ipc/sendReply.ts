// Create main process IPC handler for sendReply
import { ipcMain } from 'electron'
import { sendReply } from '../google/auth'

// Add this IPC handler to your main process
ipcMain.handle('send-reply', async (_, data) => {
  try {
    await sendReply(data.threadId, data.messageId, data.to, data.subject, data.body)
    return { success: true }
  } catch (error) {
    console.error('Send reply error:', error)
    throw error
  }
})