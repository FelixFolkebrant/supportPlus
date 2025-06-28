import { useState } from 'react'
import type React from 'react'
import { useDrive } from '../../hooks/useDrive'
import { FolderPicker } from './FolderPicker'

interface KnowledgeBaseModalProps {
  isOpen: boolean
  onClose: () => void
}

export function KnowledgeBaseModal({
  isOpen,
  onClose
}: KnowledgeBaseModalProps): React.JSX.Element {
  const [showFolderPicker, setShowFolderPicker] = useState(false)

  const {
    knowledgeBaseFolder,
    selectedFiles,
    loading,
    error,
    selectKnowledgeBaseFolder,
    clearKnowledgeBase,
    refreshFiles
  } = useDrive()

  if (!isOpen) return <></>

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Knowledge Base</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
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

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
              {error}
            </div>
          )}

          {!knowledgeBaseFolder ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400"
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Knowledge Base Connected
              </h3>
              <p className="text-gray-600 mb-6">
                Connect a Google Drive folder to give your chat access to documents, spreadsheets,
                and PDFs.
              </p>
              <button
                onClick={() => setShowFolderPicker(true)}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Connecting...' : 'Connect Drive Folder'}
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{knowledgeBaseFolder.name}</h3>
                  <p className="text-sm text-gray-600">{selectedFiles.length} documents loaded</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={refreshFiles}
                    disabled={loading}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Refreshing...' : 'Refresh'}
                  </button>
                  <button
                    onClick={clearKnowledgeBase}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              </div>

              {selectedFiles.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Available Documents:</h4>
                  {selectedFiles.map((file) => (
                    <div key={file.id} className="flex items-center p-3 bg-gray-50 rounded border">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
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
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No supported documents found in this folder.
                  <br />
                  <span className="text-xs">Supported: Google Docs, Sheets, PDFs, Text files</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      <FolderPicker
        isOpen={showFolderPicker}
        onClose={() => setShowFolderPicker(false)}
        onSelectFolder={(folder) => selectKnowledgeBaseFolder(folder.id)}
      />
    </div>
  )
}
