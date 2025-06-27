import { ChatMessage } from '../../api/chat'
import { ChatMessageBubble } from './ChatMessageBubble'

type ChatWindowProps = {
  messages: ChatMessage[]
  loading: boolean
  onShowKnowledgeTab?: () => void
}

export function ChatWindow({
  messages,
  loading,
  onShowKnowledgeTab
}: ChatWindowProps): React.JSX.Element {
  const showInstruction = messages.length === 0 && !loading
  return (
    <div className="flex-1 flex">
      {showInstruction ? (
        <div className="flex flex-1 items-center justify-center w-full h-full">
          <div className="text-center text-gray-400 p-4 select-none w-full max-w-xl mx-auto">
            This is your <b>Mail Assistant</b>. It can help you create and edit emails based on your{' '}
            <button
              className="underline text-blue-400 hover:text-blue-600 focus:outline-none bg-transparent border-none cursor-pointer p-0 m-0"
              style={{ background: 'none' }}
              onClick={onShowKnowledgeTab}
            >
              knowledge
            </button>
            . Add documents to the knowledge base to improve its answers!
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto flex flex-col gap-2 mb-4 w-full">
          {messages.map((msg, i) => (
            <ChatMessageBubble key={i} msg={msg} />
          ))}
          {loading && <div className="text-left text-gray-400">Assistant is typing...</div>}
        </div>
      )}
    </div>
  )
}
