// src/renderer/useLastMail.ts
import { useEffect, useState, useCallback } from 'react'
const { ipcRenderer } = window.electron // exposed via contextBridge

export function useMails({
  maxResults = 3,
  labelIds = ['INBOX'],
  query = 'category:primary',
  fetchOnMount = false
}: {
  maxResults?: number
  labelIds?: string[]
  query?: string
  fetchOnMount?: boolean
} = {}): [{ id?: string; subject?: string; from?: string; snippet?: string }[], () => void] {
  const [mails, setMails] = useState<
    { id?: string; subject?: string; from?: string; snippet?: string }[]
  >([])

  const fetchMails = useCallback(() => {
    ipcRenderer.invoke('gmail:getMails', { maxResults, labelIds, query }).then(setMails)
  }, [maxResults, labelIds, query])

  useEffect(() => {
    if (fetchOnMount) fetchMails()
  }, [fetchOnMount, fetchMails])

  return [mails, fetchMails]
}
