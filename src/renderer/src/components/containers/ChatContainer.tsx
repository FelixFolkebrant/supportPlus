import type React from 'react'
import { ChatWindow } from '../chat/ChatWindow'
import { ChatInput } from '../chat/ChatInput'
import { useChat } from '../../hooks/useChat'
import type { Mail } from '../../hooks/GmailContextValue'

interface ChatContainerProps {
  selectedMail: Mail | null
}

export function ChatContainer({ selectedMail }: ChatContainerProps): React.JSX.Element {
  const { messages, input, setInput, loading, sendMessage } = useChat(selectedMail)

  return (
    <div className="flex-none w-[500px] border-l border-gray-200 bg-white text-black h-full flex flex-col relative">
      <div className="flex-1 overflow-y-auto pb-20 p-4">
        <ChatWindow messages={messages} loading={loading} />
      </div>
      <div className="w-full absolute left-0 right-0 bottom-0 px-4 pb-4 bg-white">
        <ChatInput value={input} onChange={setInput} onSend={sendMessage} loading={loading} />
      </div>
    </div>
  )
}
