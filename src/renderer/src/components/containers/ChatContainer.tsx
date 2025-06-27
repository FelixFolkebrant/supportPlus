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

type TabType = 'chat' | 'settings'

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
    <div className="flex-none w-full pt-12 bg-white text-black h-full flex flex-col relative">
      {/* Tab Header */}
      <div className="py-4 flex items-center px-4 bg-white sticky top-0 z-10">
        <div className="flex space-x-4 flex-1 justify-center">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-12 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'chat'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-12 py-2 font-medium text-sm border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span>Settings</span>
          </button>
        </div>
          {activeTab === 'chat' && messages.length > 0 && (
            <div className="flex absolute right-4 space-x-2">
              <button
                onClick={handleNewChat}
                className="px-3 py-2 rounded bg-red-50 text-red-700 hover:bg-red-100 transition-colors text-sm font-medium shadow-sm"
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
                  To use the chat, please add your OpenAI API key in the settings tab.
                </div>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                  onClick={() => setActiveTab('settings')}
                >
                  Go to Settings
                </button>
              </div>
            ) : (
              <ChatWindow
                messages={messages}
                loading={loading}
                onShowSettingsTab={() => setActiveTab('settings')}
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
