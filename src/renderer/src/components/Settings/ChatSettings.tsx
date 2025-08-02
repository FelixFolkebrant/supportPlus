import React, { useState, useEffect } from 'react'
import {
  getUserOpenAIApiKey,
  setUserOpenAIApiKey,
  clearUserOpenAIApiKey
} from '../../api/apiKeyManager'

export function ChatSettings(): React.ReactElement {
  const [apiKey, setApiKey] = useState('')
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)
  const [apiKeySaved, setApiKeySaved] = useState(false)
  const [apiKeyError, setApiKeyError] = useState<string | null>(null)

  useEffect(() => {
    // Load existing API key
    const existingKey = getUserOpenAIApiKey()
    if (existingKey) {
      setApiKey(existingKey)
      setApiKeySaved(true)
    }
  }, [])

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
    <div className="flex-1 gap-6 flex-col flex overflow-y-auto p-6">
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

      {/* Additional chat settings can be added here */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Chat Preferences</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Auto-generate drafts</label>
              <p className="text-xs text-gray-500">
                Automatically generate email drafts when requested
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
              <label className="text-sm font-medium text-gray-700">Save chat history</label>
              <p className="text-xs text-gray-500">Keep conversation history for each email</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
