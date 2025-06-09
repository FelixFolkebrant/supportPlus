import { ChatMessage } from '../../api/chat'
import { Personality } from '../../api/personalities'
import { ChatMessageBubble } from './ChatMessageBubble'

type ChatWindowProps = {
  messages: ChatMessage[]
  personality: Personality
  loading: boolean
}

export function ChatWindow({ messages, personality, loading }: ChatWindowProps) : React.JSX.Element {
  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-2 mb-4">
      {messages.map((msg, i) => (
        <ChatMessageBubble key={i} msg={msg} personality={personality} />
      ))}
      {loading && (
        <div className="text-left text-gray-400">{personality.name} is typing...</div>
      )}
    </div>
  )
}
