import { useState, useEffect } from 'react'
import type React from 'react'

interface Folder {
  id: string
  name: string
}

interface FolderPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelectFolder: (folder: Folder) => void
}

const { ipcRenderer } = window.electron

export function FolderPicker({
  isOpen,
  onClose,
  onSelectFolder
}: FolderPickerProps): React.JSX.Element {
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadFolders()
    }
  }, [isOpen])

  const loadFolders = async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      const folderList = await ipcRenderer.invoke('drive:listFolders')
      setFolders(folderList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load folders')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return <></>

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Select Google Drive Folder</h3>
        </div>

        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          {loading && (
            <div className="text-center py-8">
              <div className="text-gray-600">Loading folders...</div>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="text-red-600 mb-4">{error}</div>
              <button
                onClick={loadFolders}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && folders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No folders found in your Google Drive
            </div>
          )}

          {!loading && !error && folders.length > 0 && (
            <div className="space-y-2">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => {
                    onSelectFolder(folder)
                    onClose()
                  }}
                  className="w-full text-left p-3 rounded border hover:bg-gray-50 transition-colors flex items-center space-x-3"
                >
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                  <span className="font-medium text-gray-900">{folder.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
