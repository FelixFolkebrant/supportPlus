import { useEffect, useState, ReactNode, ReactElement } from 'react'
import { UnansweredMailsContext } from './UnansweredMailsContextValue'

const { ipcRenderer } = window.electron // exposed via contextBridge

export type Mail = {
  id?: string
  subject?: string
  from?: string
  snippet?: string
}

export const UnansweredMailsProvider = ({
  children,
  maxResults = 3,
  labelIds = ['INBOX'],
  query = 'category:primary'
}: {
  children: ReactNode
  maxResults?: number
  labelIds?: string[]
  query?: string
}): ReactElement => {
  const [mails, setMails] = useState<Mail[]>([])
  const [loading, setLoading] = useState(false)

  const fetchMails = (): void => {
    setLoading(true)
    ipcRenderer
      .invoke('gmail:getUnansweredMails', { maxResults, labelIds, query })
      .then((data: Mail[]) => setMails(data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchMails()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxResults, labelIds, query])

  return (
    <UnansweredMailsContext.Provider value={{ mails, refresh: fetchMails, loading }}>
      {children}
    </UnansweredMailsContext.Provider>
  )
}
