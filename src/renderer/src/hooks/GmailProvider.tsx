import { createContext, useContext, useEffect, useState, ReactNode, ReactElement } from 'react'

const { ipcRenderer } = window.electron // exposed via contextBridge

export type Mail = {
  id?: string
  subject?: string
  from?: string
  snippet?: string
}

interface GmailContextType {
  mails: Mail[]
  loading: boolean
  refresh: () => void
}

const GmailContext = createContext<GmailContextType | undefined>(undefined)

export const GmailProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const [mails, setMails] = useState<Mail[]>([])
  const [loading, setLoading] = useState(false)

  const fetchUnansweredMails = (): void => {
    setLoading(true)
    ipcRenderer
      .invoke('gmail:getUnansweredMails', {
        maxResults: 50,
        labelIds: ['INBOX'],
        query: 'category:primary is:unread'
      })
      .then((data: Mail[]) => setMails(data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchUnansweredMails()
  }, [])

  return (
    <GmailContext.Provider value={{ mails, loading, refresh: fetchUnansweredMails }}>
      {children}
    </GmailContext.Provider>
  )
}

export const useGmail = (): GmailContextType => {
  const ctx = useContext(GmailContext)
  if (!ctx) throw new Error('useGmail must be used within GmailProvider')
  return ctx
}
