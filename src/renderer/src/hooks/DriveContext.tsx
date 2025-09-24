import React, { createContext, useState, useEffect, type ReactNode } from 'react'
import type { DriveFile, DriveFolder, DriveContextValue } from './DriveTypes'
import { KNOWLEDGE_BASE_STORAGE_KEY } from './DriveTypes'

const DriveContext = createContext<DriveContextValue | null>(null)

export { DriveContext }

const { ipcRenderer } = window.electron

export const DriveProvider = ({ children }: { children: ReactNode }): React.JSX.Element => {
  const [knowledgeBaseFolder, setKnowledgeBaseFolder] = useState<DriveFolder | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<DriveFile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load saved knowledge base folder on mount
  useEffect((): void => {
    const loadSavedFolder = async (): Promise<void> => {
      try {
        const saved = localStorage.getItem(KNOWLEDGE_BASE_STORAGE_KEY)
        if (saved) {
          const savedFolder = JSON.parse(saved) as DriveFolder
          console.log('Loading saved knowledge base folder:', savedFolder.name)
          setKnowledgeBaseFolder(savedFolder)
          await loadFileContents(savedFolder.files)
        }
      } catch (err) {
        console.error('Failed to load saved knowledge base:', err)
        localStorage.removeItem(KNOWLEDGE_BASE_STORAGE_KEY)
      }
    }

    loadSavedFolder()
  }, [])

  // Save knowledge base folder when it changes
  useEffect(() => {
    if (knowledgeBaseFolder) {
      localStorage.setItem(KNOWLEDGE_BASE_STORAGE_KEY, JSON.stringify(knowledgeBaseFolder))
    } else {
      localStorage.removeItem(KNOWLEDGE_BASE_STORAGE_KEY)
    }
  }, [knowledgeBaseFolder])

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
          if (
            file.mimeType.includes('text') ||
            file.mimeType.includes('document') ||
            file.mimeType.includes('spreadsheet') ||
            file.mimeType === 'application/pdf'
          ) {
            try {
              const content = await ipcRenderer.invoke('drive:getFileContent', file.id)
              // Debug: Log file and content
              console.log('Loaded file:', file.name)
              console.log('Loaded content:', content)
              return { ...file, content }
            } catch {
              return file
            }
          }
          return file
        })
      )
      setSelectedFiles(filesWithContent.filter((f) => f.content))
      // Debug: Log all selected files after loading
      console.log('All selected files after loading:', filesWithContent)
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
    localStorage.removeItem(KNOWLEDGE_BASE_STORAGE_KEY)
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
