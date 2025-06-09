import { useState } from 'react'
import { Personality } from '../../api/personalities'
import { chatWithOpenAI, ChatMessage } from '../../api/chat'
import { PersonalitySelector } from './PersonalitySelector'
import { ChatWindow } from './ChatWindow'
import { ChatInput } from './ChatInput'

export function Chat(): React.JSX.Element {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentPersonality, setCurrentPersonality] = useState<Personality>({
    id: 'default',
    name: 'Default Assistant',
    systemPrompt: 'You are a helpful assistant.'
  })

  const handleSend = async (): Promise<void> => {
    if (!input.trim()) return
    const newMessages = [...messages, { role: 'user' as const, content: input }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    let assistantMsg = ''
    await chatWithOpenAI(newMessages, currentPersonality, (token) => {
      assistantMsg += token
      setMessages((prev) => {
        if (prev[prev.length - 1]?.role === 'assistant') {
          return [...prev.slice(0, -1), { role: 'assistant', content: assistantMsg }]
        } else {
          return [...prev, { role: 'assistant', content: assistantMsg }]
        }
      })
    })
    setLoading(false)
  }

  return (
    <div className="w-full h-screen box-border p-5 flex flex-col">
      <PersonalitySelector current={currentPersonality} onChange={setCurrentPersonality} />
      <ChatWindow messages={messages} personality={currentPersonality} loading={loading} />
      <ChatInput value={input} onChange={setInput} onSend={handleSend} loading={loading} />
    </div>
  )
}
