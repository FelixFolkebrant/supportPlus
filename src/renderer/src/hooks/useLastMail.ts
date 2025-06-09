// src/renderer/useLastMail.ts
import { useEffect, useState } from 'react'
const { ipcRenderer } = window.electron // exposed via contextBridge

export function useMails({
  maxResults = 3,
  labelIds = ['INBOX'],
  query = 'category:primary'
}: {
  maxResults?: number
  labelIds?: string[]
  query?: string
} = {}): { id?: string; subject?: string; from?: string; snippet?: string }[] {
  const [mails, setMails] = useState<
    { id?: string; subject?: string; from?: string; snippet?: string }[]
  >([])

  useEffect(() => {
    ipcRenderer.invoke('gmail:getMails', { maxResults, labelIds, query }).then(setMails)
  }, [maxResults, labelIds, query])

  return mails
}
