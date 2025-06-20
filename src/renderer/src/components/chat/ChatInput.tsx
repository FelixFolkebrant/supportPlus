import { SendHorizontal } from 'lucide-react'

type ChatInputProps = {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  loading: boolean
}

export function ChatInput({ value, onChange, onSend, loading }: ChatInputProps): React.JSX.Element {
  return (
    <div className="flex px-2 gap-2 border border-black rounded-full mt-2">
      <input
        className="flex-1 px-2 py-2 text-base outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !loading) onSend()
        }}
        placeholder="Type your message..."
        disabled={loading}
        style={{ background: 'none', border: 'none', boxShadow: 'none' }}
      />
      <button
        className="px-4 py-2 text-white rounded"
        onClick={onSend}
        disabled={loading || !value.trim()}
      >
        <SendHorizontal stroke="black" />
      </button>
    </div>
  )
}
