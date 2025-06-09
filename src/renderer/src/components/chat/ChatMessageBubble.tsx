import { ChatMessage } from '../../api/chat'
import { Personality } from '../../api/personalities'

type ChatMessageProps = {
  msg: ChatMessage
  personality: Personality
}

export function ChatMessageBubble({ msg, personality }: ChatMessageProps): React.JSX.Element {
  return (
    <div className={msg.role === 'user' ? 'text-right' : 'text-left'}>
      <span
        className={msg.role === 'user' ? 'text-white' : 'text-white'}
        style={{
          display: 'inline-block',
          borderRadius: 8,
          padding: '6px 12px',
          margin: '2px 0',
          background: 'none',
          border: 'none',
          boxShadow: 'none',
          fontSize: 16,
          maxWidth: '80%',
          wordBreak: 'break-word',
        }}
      >
        <b>{msg.role === 'user' ? 'You' : personality.name}:</b> {msg.content}
      </span>
    </div>
  )
}
