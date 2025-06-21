import { ipcMain } from 'electron'
import { getDriveClient } from './auth'
import type { drive_v3 } from 'googleapis'

interface DriveFile {
  id: string
  name: string
  mimeType: string
  webViewLink?: string
  modifiedTime?: string
}

interface DriveFolder {
  id: string
  name: string
  files: DriveFile[]
}

export function setupDriveHandlers(): void {
  // Add folder listing handler
  ipcMain.handle('drive:listFolders', async () => {
    try {
      const drive = await getDriveClient()
      
      const foldersResponse = await drive.files.list({
        q: "mimeType='application/vnd.google-apps.folder' and 'me' in owners and trashed=false",
        fields: 'files(id, name)',
        pageSize: 100,
        orderBy: 'name'
      })

      return (foldersResponse.data.files || []).map((folder) => ({
        id: folder.id!,
        name: folder.name!
      }))
    } catch (error) {
      console.error('Error listing folders:', error)
      throw error
    }
  })

  // Update the selectFolder handler to accept a folder ID
  ipcMain.handle('drive:selectFolder', async (_, folderId?: string) => {
    try {
      const drive = await getDriveClient()
      
      let selectedFolderId: string
      
      if (folderId) {
        selectedFolderId = folderId
      } else {
        // Fallback to first folder if no ID provided
        const foldersResponse = await drive.files.list({
          q: "mimeType='application/vnd.google-apps.folder' and 'me' in owners",
          fields: 'files(id, name)',
          pageSize: 1
        })

        const folders = foldersResponse.data.files || []
        if (folders.length === 0) {
          throw new Error('No folders found in your Google Drive')
        }
        selectedFolderId = folders[0].id!
      }

      // Get folder metadata
      const folderResponse = await drive.files.get({
        fileId: selectedFolderId,
        fields: 'id, name'
      })

      // Get files in the selected folder
      const filesResponse = await drive.files.list({
        q: `'${selectedFolderId}' in parents and trashed=false`,
        fields: 'files(id, name, mimeType, webViewLink, modifiedTime)',
        pageSize: 100
      })

      const files: DriveFile[] = (filesResponse.data.files || []).map((file) => ({
        id: file.id!,
        name: file.name!,
        mimeType: file.mimeType!,
        webViewLink: file.webViewLink,
        modifiedTime: file.modifiedTime
      }))

      return {
        id: folderResponse.data.id!,
        name: folderResponse.data.name!,
        files
      } as DriveFolder
    } catch (error) {
      console.error('Error selecting folder:', error)
      throw error
    }
  })

  ipcMain.handle('drive:getFileContent', async (_, fileId: string) => {
    try {
      const drive = await getDriveClient()
      
      // Get file metadata first to determine type
      const fileMetadata = await drive.files.get({
        fileId,
        fields: 'mimeType, name'
      })

      const mimeType = fileMetadata.data.mimeType

      if (!mimeType) {
        throw new Error('Could not determine file type')
      }

      let content = ''

      if (mimeType === 'application/vnd.google-apps.document') {
        // Google Docs - export as plain text
        const response = await drive.files.export({
          fileId,
          mimeType: 'text/plain'
        })
        content = response.data as string
      } else if (mimeType === 'application/vnd.google-apps.spreadsheet') {
        // Google Sheets - export as CSV
        const response = await drive.files.export({
          fileId,
          mimeType: 'text/csv'
        })
        content = response.data as string
      } else if (mimeType === 'application/pdf') {
        // PDF files - get the file content (you might need a PDF parser)
        const response = await drive.files.get({
          fileId,
          alt: 'media'
        })
        // For now, just indicate it's a PDF - you'd need a PDF text extraction library
        content = `[PDF Content from ${fileMetadata.data.name}] - PDF text extraction not implemented yet`
      } else if (mimeType.startsWith('text/')) {
        // Plain text files
        const response = await drive.files.get({
          fileId,
          alt: 'media'
        })
        content = response.data as string
      } else {
        throw new Error(`Unsupported file type: ${mimeType}`)
      }

      return content
    } catch (error) {
      console.error('Error getting file content:', error)
      throw error
    }
  })

  ipcMain.handle('drive:refreshFolder', async (_, folderId: string) => {
    try {
      const drive = await getDriveClient()
      
      // Get folder metadata
      const folderResponse = await drive.files.get({
        fileId: folderId,
        fields: 'id, name'
      })

      // Get updated files in the folder
      const filesResponse = await drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id, name, mimeType, webViewLink, modifiedTime)',
        pageSize: 100
      })

      const files: DriveFile[] = (filesResponse.data.files || []).map(file => ({
        id: file.id!,
        name: file.name!,
        mimeType: file.mimeType!,
        webViewLink: file.webViewLink,
        modifiedTime: file.modifiedTime
      }))

      return {
        id: folderResponse.data.id!,
        name: folderResponse.data.name!,
        files
      } as DriveFolder
    } catch (error) {
      console.error('Error refreshing folder:', error)
      throw error
    }
  })
}