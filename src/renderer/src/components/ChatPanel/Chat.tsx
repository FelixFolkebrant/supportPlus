import type React from 'react'
import { useEffect } from 'react'
import { ChatWindow } from './ChatWindow'
import { ChatInput } from './ChatInput'
import { useChat } from '../../hooks/useChat'
import { useDrive } from '../../hooks/useDrive'
import type { Mail } from '../../hooks/GmailContextValue'
import { hasValidOpenAIApiKey } from '../../api/apiKeyManager'

interface ChatProps {
  selectedMail: Mail | null
  updateResponseMail?: (mailId: string, content: string) => void
  setMailEditingState?: (isEditing: boolean) => void
}

export function Chat({
  selectedMail,
  updateResponseMail,
  setMailEditingState
}: ChatProps): React.JSX.Element {
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

  // Note: Drive context is available for future use
  useDrive()

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
      {/* Header */}
      <div className="py-4 flex items-center px-4 bg-white sticky top-0 z-10">
        <div className="flex justify-between items-center w-full">
          <h2 className="text-xl font-semibold text-gray-900">Chat Assistant</h2>
          {messages.length > 0 && (
            <button
              onClick={handleNewChat}
              className="px-3 py-2 rounded bg-red-50 text-red-700 hover:bg-red-100 transition-colors text-sm font-medium shadow-sm"
            >
              Clear chat
            </button>
          )}
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 overflow-y-auto pb-20 justify-center flex p-4">
        {!hasValidOpenAIApiKey() ? (
          <div className="w-full flex flex-col items-center justify-center text-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="mb-4 text-2xl">⚠️</div>
            <div className="mb-2 font-semibold text-lg text-yellow-800">
              OpenAI API key required
            </div>
            <div className="mb-4 text-yellow-700 text-sm max-w-md">
              To use the chat, please add your OpenAI API key in the Settings tab.
            </div>
          </div>
        ) : (
          <ChatWindow messages={messages} loading={loading} />
        )}
      </div>

      {/* Chat Input */}
      <div className="w-full absolute left-0 right-0 bottom-0 px-4 pb-4 bg-white">
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={sendMessage}
          loading={loading}
          disabled={!hasValidOpenAIApiKey()}
        />
      </div>
    </div>
  )
}
