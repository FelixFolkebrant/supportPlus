import type React from 'react'
import { ChatWindow } from '../chat/ChatWindow'
import { ChatInput } from '../chat/ChatInput'
import { PersonalitySelector } from '../chat/PersonalitySelector'
import { useChat } from '../../hooks/useChat'

export function ChatContainer(): React.JSX.Element {
  const { messages, input, setInput, personality, setPersonality, loading, sendMessage } = useChat()

  return (
    <div className="flex-none w-[400px] border-l border-gray-200 bg-red-500 h-full p-4 overflow-y-auto">
      <PersonalitySelector current={personality} onChange={setPersonality} />
      <ChatWindow messages={messages} personality={personality} loading={loading} />
      <ChatInput value={input} onChange={setInput} onSend={sendMessage} loading={loading} />
    </div>
  )
}
