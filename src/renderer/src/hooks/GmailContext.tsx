import { createContext, ReactNode, useEffect, useState } from 'react'

export type Mail = {
  id?: string
  subject?: string
  from?: string
  snippet?: string
}

export interface GmailContextType {
  mails: Mail[]
  unansweredMails: Mail[]
  loading: boolean
  refresh: () => void
}

export const GmailContext = createContext<GmailContextType | undefined>(undefined)

const { ipcRenderer } = window.electron // exposed via contextBridge

export const GmailProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [mails, setMails] = useState<Mail[]>([])
  const [unansweredMails, setUnansweredMails] = useState<Mail[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const fetchAll = (): void => {
    setLoading(true)
    Promise.all([
      ipcRenderer.invoke('gmail:getMails', { maxResults: 3, labelIds: ['INBOX'], query: '' }),
      ipcRenderer.invoke('gmail:getUnansweredMails', { maxResults: 3, labelIds: ['INBOX'], query: 'category:primary is:unread' }),
    ])
      .then(([allData, unansweredData]) => {
        setMails(allData as Mail[])
        setUnansweredMails(unansweredData as Mail[])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchAll()
  }, [])

  return (
    <GmailContext.Provider value={{ mails, unansweredMails, loading, refresh: fetchAll }}>
      {children}
    </GmailContext.Provider>
  )
}
