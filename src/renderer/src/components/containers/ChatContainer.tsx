import type React from 'react'
import { useEffect, useState } from 'react'
import { ChatWindow } from '../chat/ChatWindow'
import { ChatInput } from '../chat/ChatInput'
import { DocumentsTab } from '../chat/DocumentsTab'
import { useChat } from '../../hooks/useChat'
import { useDrive } from '../../hooks/DriveContext'
import type { Mail } from '../../hooks/GmailContextValue'
import { hasValidOpenAIApiKey } from '../../api/apiKeyManager'

interface ChatContainerProps {
  selectedMail: Mail | null
  updateResponseMail?: (mailId: string, content: string) => void
  setMailEditingState?: (isEditing: boolean) => void
}

type TabType = 'chat' | 'documents'

export function ChatContainer({
  selectedMail,
  updateResponseMail,
  setMailEditingState
}: ChatContainerProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabType>('chat')

  const {
    messages,
    input,
    setInput,
    loading,
    sendMessage,
    clearMessages,
    setUpdateResponseMail,
    setMailEditingState: setChatMailEditingState
  } = useChat(selectedMail)

  const { knowledgeBaseFolder, selectedFiles } = useDrive()

  // Set the update function for the chat hook
  useEffect(() => {
    if (updateResponseMail) {
      setUpdateResponseMail(updateResponseMail)
    }
  }, [updateResponseMail, setUpdateResponseMail])

  // Set the mail editing state function for the chat hook
  useEffect(() => {
    if (setMailEditingState) {
      setChatMailEditingState(setMailEditingState)
    }
  }, [setMailEditingState, setChatMailEditingState])

  const handleNewChat = (): void => {
    clearMessages()
  }

  return (
    <div className="flex-none w-full bg-white text-black h-full flex flex-col relative">
      {/* Tab Header */}
      <div className="h-14 flex items-center px-4 bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex space-x-4 flex-1">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'chat'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'documents'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span>Documents</span>
            {knowledgeBaseFolder && (
              <div className="flex items-center space-x-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{selectedFiles.length}</span>
              </div>
            )}
          </button>
        </div>

        {activeTab === 'chat' && (
          <div className="flex space-x-2">
            <button
              onClick={handleNewChat}
              className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
            >
              Clear chat
            </button>
          </div>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'chat' ? (
        <>
          <div className="flex-1 overflow-y-auto pb-20 justify-center flex p-4">
            {!hasValidOpenAIApiKey() ? (
              <div className="w-full flex flex-col items-center justify-center text-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="mb-4 text-2xl">⚠️</div>
                <div className="mb-2 font-semibold text-lg text-yellow-800">
                  OpenAI API key required
                </div>
                <div className="mb-4 text-yellow-700 text-sm max-w-md">
                  To use the chat, please add your OpenAI API key in the Documents tab.
                </div>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                  onClick={() => setActiveTab('documents')}
                >
                  Go to Documents
                </button>
              </div>
            ) : (
              <ChatWindow
                messages={messages}
                loading={loading}
                onShowKnowledgeTab={() => setActiveTab('documents')}
              />
            )}
          </div>
          <div className="w-full absolute left-0 right-0 bottom-0 px-4 pb-4 bg-white">
            <ChatInput
              value={input}
              onChange={setInput}
              onSend={sendMessage}
              loading={loading}
              disabled={!hasValidOpenAIApiKey()}
            />
          </div>
        </>
      ) : (
        <DocumentsTab />
      )}
    </div>
  )
}
