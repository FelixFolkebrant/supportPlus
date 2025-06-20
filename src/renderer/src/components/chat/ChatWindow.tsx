import { ChatMessage } from '../../api/chat'
import { ChatMessageBubble } from './ChatMessageBubble'

type ChatWindowProps = {
  messages: ChatMessage[]
  loading: boolean
}

export function ChatWindow({ messages, loading }: ChatWindowProps): React.JSX.Element {
  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-2 mb-4">
      {messages.map((msg, i) => (
        <ChatMessageBubble key={i} msg={msg} />
      ))}
      {loading && <div className="text-left text-gray-400">Assistant is typing...</div>}
    </div>
  )
}
