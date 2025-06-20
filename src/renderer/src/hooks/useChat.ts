import { useState, useRef } from 'react'
import { ChatMessage, chatWithOpenAI } from '../api/chat'
import { DEFAULT_PERSONALITY } from '../api/personalities'
import type { Mail } from './GmailContextValue'

interface UseChatReturn {
  messages: ChatMessage[]
  input: string
  setInput: (value: string) => void
  loading: boolean
  sendMessage: () => Promise<void>
  clearMessages: () => void
}

export function useChat(selectedMail?: Mail | null): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const assistantContentRef = useRef('')

  const sendMessage = async (): Promise<void> => {
    if (!input.trim() || loading) return

    const userMessage: ChatMessage = { role: 'user', content: input }
    let contextMessages = [...messages, userMessage]
    // If there is a selected mail, prepend its content as a system message
    if (selectedMail && (selectedMail.subject || selectedMail.body)) {
      const mailContext = `You are helping the user with the following email.\nSubject: ${selectedMail.subject || ''}\nFrom: ${selectedMail.from || ''}\nBody: ${selectedMail.body || ''}`
      contextMessages = [{ role: 'system', content: mailContext }, ...contextMessages]
    }
    setMessages([...messages, userMessage])
    setInput('')
    setLoading(true)
    try {
      const assistantMessage: ChatMessage = { role: 'assistant', content: '' }
      setMessages((prev) => [...prev, assistantMessage])
      assistantContentRef.current = ''
      await chatWithOpenAI(contextMessages, DEFAULT_PERSONALITY, (token: string) => {
        assistantContentRef.current += token
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages]
          const lastMessage = updatedMessages[updatedMessages.length - 1]
          if (lastMessage && lastMessage.role === 'assistant') {
            lastMessage.content = assistantContentRef.current
          }
          return updatedMessages
        })
      })
    } catch (error) {
      console.error('Chat API error:', error)
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
    loading,
    sendMessage,
    clearMessages
  }
}
