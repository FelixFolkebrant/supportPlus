import { useState } from 'react'
import type { Mail } from './GmailContextValue'

const { ipcRenderer } = window.electron

interface UseEmailReturn {
  sendReplyEmail: (body: string) => Promise<void>
  sendingReply: boolean
}

export function useEmail(mail: Mail): UseEmailReturn {
  const [sendingReply, setSendingReply] = useState(false)

  const sendReplyEmail = async (body: string): Promise<void> => {
    console.log('Sending reply email:', {
      messageId: mail.id,
      body
    })
    setSendingReply(true)
    try {
      await ipcRenderer.invoke('gmail:sendReply', {
        messageId: mail.id,
        body
      })
      
      // Clear the saved draft after successful send
      localStorage.removeItem(`responseMail:${mail.id}`)
    } catch (error) {
      console.error('Failed to send reply:', error)
      throw error
    } finally {
      setSendingReply(false)
    }
  }

  return {
    sendReplyEmail,
    sendingReply
  }
}
