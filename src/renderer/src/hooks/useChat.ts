import { useState } from 'react'
import { ChatMessage, chatWithOpenAI } from '../api/chat'
import { Personality, PERSONALITIES } from '../api/personalities'

interface UseChatReturn {
  messages: ChatMessage[]
  input: string
  setInput: (value: string) => void
  personality: Personality
  setPersonality: (personality: Personality) => void
  loading: boolean
  sendMessage: () => Promise<void>
  clearMessages: () => void
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [personality, setPersonality] = useState<Personality>(PERSONALITIES[0])
  const [loading, setLoading] = useState(false)

  const sendMessage = async (): Promise<void> => {
    if (!input.trim() || loading) return

    const userMessage: ChatMessage = { role: 'user', content: input }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      // Create assistant message with empty content to start streaming
      const assistantMessage: ChatMessage = { role: 'assistant', content: '' }
      setMessages([...newMessages, assistantMessage])

      await chatWithOpenAI(newMessages, personality, (token: string) => {
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages]
          const lastMessage = updatedMessages[updatedMessages.length - 1]
          if (lastMessage && lastMessage.role === 'assistant') {
            lastMessage.content += token
          }
          return updatedMessages
        })
      })
    } catch (error) {
      console.error('Chat API error:', error)
      // Remove the empty assistant message and add error message
      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1),
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const clearMessages = (): void => setMessages([])

  return {
    messages,
    input,
    setInput,
    personality,
    setPersonality,
    loading,
    sendMessage,
    clearMessages
  }
}
