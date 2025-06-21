import { createContext, useContext, useState, type ReactNode } from 'react'
import type React from 'react'

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  webViewLink?: string
  modifiedTime?: string
  content?: string
}

export interface DriveFolder {
  id: string
  name: string
  files: DriveFile[]
}

interface DriveContextValue {
  knowledgeBaseFolder: DriveFolder | null
  selectedFiles: DriveFile[]
  loading: boolean
  error: string | null
  selectKnowledgeBaseFolder: (folderId?: string) => Promise<void>
  clearKnowledgeBase: () => void
  refreshFiles: () => Promise<void>
}

const DriveContext = createContext<DriveContextValue | null>(null)

export const useDrive = (): DriveContextValue => {
  const context = useContext(DriveContext)
  if (!context) {
    throw new Error('useDrive must be used within a DriveProvider')
  }
  return context
}

const { ipcRenderer } = window.electron

export const DriveProvider = ({ children }: { children: ReactNode }): React.JSX.Element => {
  const [knowledgeBaseFolder, setKnowledgeBaseFolder] = useState<DriveFolder | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<DriveFile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectKnowledgeBaseFolder = async (folderId?: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      const folder = await ipcRenderer.invoke('drive:selectFolder', folderId)
      if (folder) {
        setKnowledgeBaseFolder(folder)
        await loadFileContents(folder.files)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select folder')
    } finally {
      setLoading(false)
    }
  }

  const loadFileContents = async (files: DriveFile[]): Promise<void> => {
    try {
      const filesWithContent = await Promise.all(
        files.map(async (file) => {
          if (file.mimeType.includes('text') || 
              file.mimeType.includes('document') || 
              file.mimeType.includes('spreadsheet') ||
              file.mimeType === 'application/pdf') {
            try {
              const content = await ipcRenderer.invoke('drive:getFileContent', file.id)
              return { ...file, content }
            } catch {
              return file
            }
          }
          return file
        })
      )
      setSelectedFiles(filesWithContent.filter(f => f.content))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load file contents')
    }
  }

  const refreshFiles = async (): Promise<void> => {
    if (!knowledgeBaseFolder) return
    
    try {
      setLoading(true)
      setError(null)
      const updatedFolder = await ipcRenderer.invoke('drive:refreshFolder', knowledgeBaseFolder.id)
      if (updatedFolder) {
        setKnowledgeBaseFolder(updatedFolder)
        await loadFileContents(updatedFolder.files)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh files')
    } finally {
      setLoading(false)
    }
  }

  const clearKnowledgeBase = (): void => {
    setKnowledgeBaseFolder(null)
    setSelectedFiles([])
    setError(null)
  }

  return (
    <DriveContext.Provider
      value={{
        knowledgeBaseFolder,
        selectedFiles,
        loading,
        error,
        selectKnowledgeBaseFolder,
        clearKnowledgeBase,
        refreshFiles
      }}
    >
      {children}
    </DriveContext.Provider>
  )
}