import React, { useState, useEffect } from 'react'
import { useDrive } from '../../hooks/useDrive'

interface Folder {
  id: string
  name: string
}

const { ipcRenderer } = window.electron

export function GoogleDriveSettings(): React.ReactElement {
  const [showFolderPicker, setShowFolderPicker] = useState(false)
  const [folders, setFolders] = useState<Folder[]>([])
  const [folderLoading, setFolderLoading] = useState(false)
  const [folderError, setFolderError] = useState<string | null>(null)

  const {
    knowledgeBaseFolder,
    selectedFiles,
    loading,
    error,
    selectKnowledgeBaseFolder,
    clearKnowledgeBase,
    refreshFiles
  } = useDrive()

  useEffect(() => {
    if (showFolderPicker) {
      loadFolders()
    }
  }, [showFolderPicker])

  const loadFolders = async (): Promise<void> => {
    try {
      setFolderLoading(true)
      setFolderError(null)
      const folderList = await ipcRenderer.invoke('drive:listFolders')
      setFolders(folderList)
    } catch (err) {
      setFolderError(err instanceof Error ? err.message : 'Failed to load folders')
    } finally {
      setFolderLoading(false)
    }
  }

  const handleSelectFolder = (folder: Folder): void => {
    selectKnowledgeBaseFolder(folder.id)
    setShowFolderPicker(false)
  }

  return (
    <div className="flex-1 gap-6 flex-col flex overflow-y-auto p-6">
      {/* Knowledge Base Configuration */}
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Knowledge Base
          </h3>
          {knowledgeBaseFolder && (
            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
              ✓ Connected
            </span>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
            {error}
          </div>
        )}

        {!knowledgeBaseFolder ? (
          <div>
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2 text-center">
              No Knowledge Base Connected
            </h3>
            <p className="text-gray-600 text-center mb-4">
              Connect a Google Drive folder to give your chat access to documents, spreadsheets and
              PDFs.
            </p>
            <div className="text-center">
              <button
                onClick={() => setShowFolderPicker(true)}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Connecting...' : 'Connect Drive Folder'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{knowledgeBaseFolder.name}</h3>
                <p className="text-sm text-gray-600">{selectedFiles.length} documents loaded</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={refreshFiles}
                  disabled={loading}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
                <button
                  onClick={() => setShowFolderPicker(true)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  Change Folder
                </button>
                <button
                  onClick={clearKnowledgeBase}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {file.mimeType.includes('document') && '📄 Document'}
                        {file.mimeType.includes('spreadsheet') && '📊 Spreadsheet'}
                        {file.mimeType === 'application/pdf' && '📕 PDF'}
                        {file.mimeType.includes('text') && '📝 Text'}
                      </p>
                    </div>
                    {file.content && (
                      <div className="text-xs text-green-600 font-medium">✓ Loaded</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showFolderPicker && (
          <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Select Google Drive Folder</h3>
              <button
                onClick={() => setShowFolderPicker(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {folderLoading && (
              <div className="text-center py-8">
                <div className="text-gray-600">Loading folders...</div>
              </div>
            )}

            {folderError && (
              <div className="text-center py-8">
                <div className="text-red-600 mb-4">{folderError}</div>
                <button
                  onClick={loadFolders}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            )}

            {!folderLoading && !folderError && folders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No folders found in your Google Drive
              </div>
            )}

            {!folderLoading && !folderError && folders.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => handleSelectFolder(folder)}
                    className="w-full text-left p-3 rounded border border-gray-200 hover:bg-gray-50 transition-colors flex items-center space-x-3"
                  >
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">{folder.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Additional Drive settings */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Drive Preferences</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Auto-refresh documents</label>
              <p className="text-xs text-gray-500">
                Automatically check for updated documents every hour
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Include subdirectories</label>
              <p className="text-xs text-gray-500">
                Include documents from folders within the selected folder
              </p>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
