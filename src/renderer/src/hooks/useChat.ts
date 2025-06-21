import React, { useState, useRef } from 'react'
import {
  ChatMessage,
  chatWithOpenAI,
  ResponseMailUpdateFunction,
  MailEditingStateFunction
} from '../api/chat'
import { DEFAULT_PERSONALITY } from '../api/personalities'
import type { Mail } from './GmailContextValue'
import { useDrive } from './DriveContext'

const { ipcRenderer } = window.electron

interface UseChatReturn {
  messages: ChatMessage[]
  input: string
  setInput: (value: string) => void
  loading: boolean
  sendMessage: () => Promise<void>
  clearMessages: () => void
  setUpdateResponseMail: (fn: ResponseMailUpdateFunction) => void
  setMailEditingState: (fn: MailEditingStateFunction) => void
  sendReplyEmail: (responseContent: string) => Promise<void>
  sendingReply: boolean
}

export function useChat(selectedMail?: Mail | null): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sendingReply, setSendingReply] = useState(false)
  const assistantContentRef = useRef('')
  const updateResponseMailRef = useRef<ResponseMailUpdateFunction | undefined>(undefined)
  const mailEditingStateRef = useRef<MailEditingStateFunction | undefined>(undefined)
  const { selectedFiles } = useDrive()

  const setUpdateResponseMail = (fn: ResponseMailUpdateFunction): void => {
    updateResponseMailRef.current = fn
  }

  const setMailEditingState = (fn: MailEditingStateFunction): void => {
    mailEditingStateRef.current = fn
  }

  // Key for localStorage per mail
  const chatStorageKey = selectedMail ? `chatHistory:${selectedMail.id}` : null

  // Load chat history when mail changes
  React.useEffect(() => {
    if (chatStorageKey) {
      const saved = localStorage.getItem(chatStorageKey)
      if (saved) {
        setMessages(JSON.parse(saved))
      } else {
        setMessages([])
      }
    }
  }, [chatStorageKey])

  // Save chat history on messages change
  React.useEffect(() => {
    if (chatStorageKey) {
      localStorage.setItem(chatStorageKey, JSON.stringify(messages))
    }
  }, [messages, chatStorageKey])

  const sendMessage = async (): Promise<void> => {
    if (!input.trim() || loading) return

    // Check if the message might be requesting a mail edit
    const couldBeMaiEditing =
      selectedMail &&
      (input.toLowerCase().includes('edit') ||
        input.toLowerCase().includes('change') ||
        input.toLowerCase().includes('update') ||
        input.toLowerCase().includes('modify') ||
        input.toLowerCase().includes('rewrite') ||
        input.toLowerCase().includes('make it') ||
        input.toLowerCase().includes('formal') ||
        input.toLowerCase().includes('casual') ||
        input.toLowerCase().includes('shorter') ||
        input.toLowerCase().includes('longer') ||
        input.toLowerCase().includes('professional') ||
        input.toLowerCase().includes('friendly'))

    // If we think this might be a mail editing request, set the loading state early
    if (couldBeMaiEditing && mailEditingStateRef.current) {
      mailEditingStateRef.current(true)
    }

    const userMessage: ChatMessage = { role: 'user', content: input }
    let contextMessages = [...messages, userMessage]
    // If there is a selected mail, prepend its content as a system message
    if (selectedMail && (selectedMail.subject || selectedMail.body)) {
      let mailContext = `You are helping the user with the following email.\nSubject: ${selectedMail.subject || ''}\nFrom: ${selectedMail.from || ''}\nBody: ${selectedMail.body || ''}`

      // Also include current response mail content if available
      const currentResponse = localStorage.getItem(`responseMail:${selectedMail.id}`)
      if (currentResponse) {
        mailContext += `\n\nCurrent response draft:\n${currentResponse}`
      }

      contextMessages = [{ role: 'system', content: mailContext }, ...contextMessages]
    }

    // Add knowledge base context as system message if available
    if (selectedFiles.length > 0) {
      const knowledgeContext = `Knowledge:\n${selectedFiles
        .map((file) => `=== ${file.name} ===\n${file.content || '[Content could not be loaded]'}`)
        .join('\n\n')}`

      contextMessages = [{ role: 'system', content: knowledgeContext }, ...contextMessages]
    }
    setMessages([...messages, userMessage])
    setInput('')
    setLoading(true)
    try {
      const assistantMessage: ChatMessage = { role: 'assistant', content: '' }
      setMessages((prev) => [...prev, assistantMessage])
      assistantContentRef.current = ''

      await chatWithOpenAI(
        contextMessages,
        DEFAULT_PERSONALITY,
        (token: string) => {
          assistantContentRef.current += token
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages]
            const lastMessage = updatedMessages[updatedMessages.length - 1]
            if (lastMessage && lastMessage.role === 'assistant') {
              lastMessage.content = assistantContentRef.current
            }
            return updatedMessages
          })
        },
        selectedMail?.id,
        updateResponseMailRef.current,
        mailEditingStateRef.current
      )
    } catch (error) {
      console.error('Chat API error:', error)
      // Clear editing state on error
      if (couldBeMaiEditing && mailEditingStateRef.current) {
        mailEditingStateRef.current(false)
      }
      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1),
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
      ])
    } finally {
      setLoading(false)
      // Clear editing state if no function was called (i.e., regular chat response)
      // This will be overridden by the chat API if a function call actually happens
      if (couldBeMaiEditing && mailEditingStateRef.current) {
        setTimeout(() => {
          if (mailEditingStateRef.current) {
            mailEditingStateRef.current(false)
          }
        }, 2000) // Give some time for function calls to be processed
      }
    }
  }

  const sendReplyEmail = async (responseContent: string): Promise<void> => {
    if (!selectedMail || !responseContent.trim() || sendingReply) return

    setSendingReply(true)
    try {
      // Call the main process to send the reply
      await ipcRenderer.invoke('gmail:sendReply', {
        threadId: selectedMail.id, // Use message id as thread id for now
        messageId: selectedMail.id,
        to: selectedMail.from || '',
        subject: selectedMail.subject || '',
        body: responseContent
      })

      // Clear the response draft after successful send
      localStorage.removeItem(`responseMail:${selectedMail.id}`)

      // Update the response mail display
      if (updateResponseMailRef.current) {
        updateResponseMailRef.current('', selectedMail.id)
      }
    } catch (error) {
      console.error('Failed to send reply:', error)
      throw error
    } finally {
      setSendingReply(false)
    }
  }

  const clearMessages = (): void => {
    setMessages([])
    if (chatStorageKey) {
      localStorage.removeItem(chatStorageKey)
    }
  }
  return {
    messages,
    input,
    setInput,
    loading,
    sendMessage,
    clearMessages,
    setUpdateResponseMail,
    setMailEditingState,
    sendReplyEmail,
    sendingReply
  }
}
