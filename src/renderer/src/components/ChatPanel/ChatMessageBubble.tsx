import { ChatMessage } from '../../api/chat'
import ReactMarkdown from 'react-markdown'

type ChatMessageProps = {
  msg: ChatMessage
}

export function ChatMessageBubble({ msg }: ChatMessageProps): React.JSX.Element {
  return (
    <div className={msg.role === 'user' ? 'text-right' : 'text-left'}>
      <span
        className={
          `inline-block max-w-[80%] text-base break-words text-black ` +
          (msg.role === 'user'
            ? 'bg-bluer rounded-2xl rounded-br-md px-4 py-2 my-1'
            : 'rounded-2xl rounded-bl-md px-4 py-2 my-1')
        }
      >
        <b>{msg.role === 'user' ? 'You' : 'Assistant'}:</b>{' '}
        {msg.role === 'assistant' ? <ReactMarkdown>{msg.content}</ReactMarkdown> : msg.content}
      </span>
    </div>
  )
}
