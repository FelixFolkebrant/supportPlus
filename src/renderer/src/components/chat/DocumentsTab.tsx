import { useState, useEffect } from 'react'
import type React from 'react'
import { useDrive } from '../../hooks/useDrive'
import {
  getUserOpenAIApiKey,
  setUserOpenAIApiKey,
  clearUserOpenAIApiKey
} from '../../api/apiKeyManager'

interface Folder {
  id: string
  name: string
}

const { ipcRenderer } = window.electron

export function DocumentsTab(): React.JSX.Element {
  const [showFolderPicker, setShowFolderPicker] = useState(false)
  const [folders, setFolders] = useState<Folder[]>([])
  const [folderLoading, setFolderLoading] = useState(false)
  const [folderError, setFolderError] = useState<string | null>(null)

  // API Key management state
  const [apiKey, setApiKey] = useState('')
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)
  const [apiKeySaved, setApiKeySaved] = useState(false)
  const [apiKeyError, setApiKeyError] = useState<string | null>(null)

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

  useEffect(() => {
    // Load existing API key
    const existingKey = getUserOpenAIApiKey()
    if (existingKey) {
      setApiKey(existingKey)
      setApiKeySaved(true)
    }
  }, [])

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

  const handleSaveApiKey = (): void => {
    try {
      setApiKeyError(null)
      if (apiKey.trim()) {
        setUserOpenAIApiKey(apiKey.trim())
        setApiKeySaved(true)
        setShowApiKeyInput(false)
      }
    } catch (error) {
      setApiKeyError(error instanceof Error ? error.message : 'Invalid API key')
    }
  }

  const handleClearApiKey = (): void => {
    clearUserOpenAIApiKey()
    setApiKey('')
    setApiKeySaved(false)
    setShowApiKeyInput(false)
    setApiKeyError(null)
  }

  return (
    <div className="flex-1 gap-6  flex-col flex overflow-y-auto p-4">
      {/* OpenAI API Key Configuration */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m2-2V5a2 2 0 00-2-2m0 0H9m4 0V3m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            OpenAI API Configuration
          </h3>
          {apiKeySaved && !showApiKeyInput && (
            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
              ✓ Configured
            </span>
          )}
        </div>

        {!showApiKeyInput && apiKeySaved ? (
          <div>
            <p className="text-sm text-gray-600 mb-3">
              OpenAI API key is configured. You can clear it if needed.
            </p>
            <button
              onClick={handleClearApiKey}
              className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
            >
              Clear API Key
            </button>
          </div>
        ) : !showApiKeyInput && !apiKeySaved ? (
          <div>
            <p className="text-sm text-gray-600 mb-3">
              To use AI features, you need to provide your OpenAI API key. Your key will be stored
              locally and never shared.
            </p>
            <button
              onClick={() => setShowApiKeyInput(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
            >
              Add API Key
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-3">
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                OpenAI API Key
              </label>
              <input
                type="password"
                id="apiKey"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value)
                  setApiKeyError(null)
                }}
                placeholder="sk-..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              {apiKeyError && <p className="text-xs text-red-600 mt-1">{apiKeyError}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Get your API key from{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  OpenAI Platform
                </a>
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleSaveApiKey}
                disabled={!apiKey.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Save Key
              </button>
              <button
                onClick={() => {
                  setShowApiKeyInput(false)
                  setApiKey(getUserOpenAIApiKey() || '')
                  setApiKeyError(null)
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          {error}
        </div>
      )}

      {showFolderPicker ? (
        <div>
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
            <div className="space-y-2 flex flex-col gap-2 pt-2">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => handleSelectFolder(folder)}
                  className="w-full text-left p-3 rounded border border-third/20 hover:bg-bluer transition-colors flex items-center space-x-3"
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
      ) : !knowledgeBaseFolder ? (
        <div className="text-center py-8 flex flex-col items-center gap-2">
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Knowledge Base Connected</h3>
          <p className="text-gray-600">
            Connect a Google Drive folder to give your chat access to documents, spreadsheets and
            PDFs.
          </p>
          <button
            onClick={() => setShowFolderPicker(true)}
            disabled={loading}
            className="px-4 py-2 top-4 relative bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
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
            <div className="flex gap-1">
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
            <div className="space-y-2 pt-3 flex flex-col gap-1">
              <h4 className="text-sm font-medium text-third mb-2">Available Documents:</h4>
              {selectedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center p-3 bg-gray rounded border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{file.name}</p>
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
  )
}
