import type React from 'react'
import { useEffect, useState } from 'react'
import { ChatWindow } from '../chat/ChatWindow'
import { ChatInput } from '../chat/ChatInput'
import { KnowledgeBaseModal } from '../chat/KnowledgeBaseModal'
import { useChat } from '../../hooks/useChat'
import { useDrive } from '../../hooks/DriveContext'
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
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(false)

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
    <div className="flex-none w-full border-l border-gray-200 bg-white text-black h-full flex flex-col relative">
      {' '}
      {/* Chat Header */}
      <div className="h-14 flex items-center px-4 bg-white font-semibold text-lg sticky top-0 z-10 justify-between">
        <div className="flex items-center space-x-3">
          <span>Chat</span>
          {knowledgeBaseFolder && (
            <div className="flex items-center space-x-1 text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{selectedFiles.length} docs</span>
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowKnowledgeBase(true)}
            className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 transition-colors text-base font-medium shadow-sm flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Add Documents</span>
          </button>
          <button
            onClick={handleNewChat}
            className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors text-base font-medium shadow-sm"
          >
            New
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pb-20 p-4">
        <ChatWindow messages={messages} loading={loading} />
      </div>
      <div className="w-full absolute left-0 right-0 bottom-0 px-4 pb-4 bg-white">
        <ChatInput value={input} onChange={setInput} onSend={sendMessage} loading={loading} />
      </div>
      <KnowledgeBaseModal isOpen={showKnowledgeBase} onClose={() => setShowKnowledgeBase(false)} />
    </div>
  )
}
