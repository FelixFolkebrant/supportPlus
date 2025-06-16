import { createContext, ReactNode, useEffect, useState } from 'react'
import type React from 'react'

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
  needsLogin: boolean
  loginInProgress: boolean
  refresh: () => void
  login: () => void
  logout: () => void
}

export const GmailContext = createContext<GmailContextType | undefined>(undefined)

const { ipcRenderer } = window.electron // exposed via contextBridge

export const GmailProvider = ({ children }: { children: ReactNode }): React.JSX.Element => {
  const [mails, setMails] = useState<Mail[]>([])
  const [unansweredMails, setUnansweredMails] = useState<Mail[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [needsLogin, setNeedsLogin] = useState<boolean>(false)
  const [loginInProgress, setLoginInProgress] = useState<boolean>(false)

  const fetchAll = (): void => {
    setLoading(true)
    setNeedsLogin(false)
    Promise.all([
      ipcRenderer.invoke('gmail:getMails', { maxResults: 3, labelIds: ['INBOX'], query: '' }),
      ipcRenderer.invoke('gmail:getUnansweredMails', {
        maxResults: 3,
        labelIds: ['INBOX'],
        query: 'category:primary is:unread'
      })
    ])
      .then(([allData, unansweredData]) => {
        setMails(allData as Mail[])
        setUnansweredMails(unansweredData as Mail[])
      })
      .catch((err) => {
        if (err && err.message && err.message.includes('invalid_grant')) {
          setNeedsLogin(true)
        }
      })
      .finally(() => setLoading(false))
  }

  const login = (): void => {
    setLoginInProgress(true)
    ipcRenderer
      .invoke('gmail:login')
      .then(() => {
        setNeedsLogin(false)
        setLoginInProgress(false)
        fetchAll()
      })
      .catch(() => {
        setNeedsLogin(true)
        setLoginInProgress(false)
      })
  }

  const logout = (): void => {
    ipcRenderer.invoke('gmail:logout').then(() => {
      setNeedsLogin(true)
      setMails([])
      setUnansweredMails([])
    })
  }

  useEffect(() => {
    ipcRenderer.invoke('gmail:hasValidToken').then((valid: boolean) => {
      if (valid) {
        fetchAll()
      } else {
        setNeedsLogin(true)
      }
    })
  }, [])

  return (
    <GmailContext.Provider
      value={{
        mails,
        unansweredMails,
        loading,
        needsLogin,
        loginInProgress,
        refresh: fetchAll,
        login,
        logout
      }}
    >
      {children}
    </GmailContext.Provider>
  )
}
