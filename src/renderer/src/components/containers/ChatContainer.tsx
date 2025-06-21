import type React from 'react'
import { useEffect } from 'react'
import { ChatWindow } from '../chat/ChatWindow'
import { ChatInput } from '../chat/ChatInput'
import { useChat } from '../../hooks/useChat'
import type { Mail } from '../../hooks/GmailContextValue'

interface ChatContainerProps {
  selectedMail: Mail | null
  updateResponseMail?: (mailId: string, content: string) => void
  setMailEditingState?: (isEditing: boolean) => void
}

export function ChatContainer({
  selectedMail,
  updateResponseMail,
  setMailEditingState
}: ChatContainerProps): React.JSX.Element {
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
    <div className="flex-none w-full border-l border-gray-200 bg-white text-black h-full flex flex-col relative">
      {/* Chat Header */}
      <div className="h-14 flex items-center px-4 bg-white font-semibold text-lg sticky top-0 z-10 justify-between">
        <span>Chat</span>
        <button
          onClick={handleNewChat}
          className="ml-2 px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors text-base font-medium shadow-sm"
        >
          New
        </button>
      </div>
      <div className="flex-1 overflow-y-auto pb-20 p-4">
        <ChatWindow messages={messages} loading={loading} />
      </div>
      <div className="w-full absolute left-0 right-0 bottom-0 px-4 pb-4 bg-white">
        <ChatInput value={input} onChange={setInput} onSend={sendMessage} loading={loading} />
      </div>
    </div>
  )
}
