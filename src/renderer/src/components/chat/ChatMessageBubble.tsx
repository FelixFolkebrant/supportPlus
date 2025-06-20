import { ChatMessage } from '../../api/chat'
import ReactMarkdown from 'react-markdown'

type ChatMessageProps = {
  msg: ChatMessage
}

export function ChatMessageBubble({ msg }: ChatMessageProps): React.JSX.Element {
  return (
    <div className={msg.role === 'user' ? 'text-right' : 'text-left'}>
      <span
        className={msg.role === 'user' ? 'text-black' : 'text-black'}
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
          wordBreak: 'break-word'
        }}
      >
        <b>{msg.role === 'user' ? 'You' : 'Assistant'}:</b>{' '}
        {msg.role === 'assistant' ? <ReactMarkdown>{msg.content}</ReactMarkdown> : msg.content}
      </span>
    </div>
  )
}
