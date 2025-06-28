// Add this import to your main process entry file (likely src/main/index.ts)
import { setupDriveHandlers } from './google/drive'

// Add this call in your main process initialization:
// setupDriveHandlers()

// Example of where to add it:
/\*
import { app, BrowserWindow } from 'electron'
import { setupGmailHandlers } from './google/gmail' // your existing handlers
import { setupDriveHandlers } from './google/drive' // new drive handlers

app.whenReady().then(() => {
// Your existing setup...
setupGmailHandlers() // if you have this
setupDriveHandlers() // add this line

// Create window, etc.
})
\*/
