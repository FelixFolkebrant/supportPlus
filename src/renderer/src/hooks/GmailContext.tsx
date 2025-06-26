import { ReactNode, useEffect, useState } from 'react'
import type React from 'react'
import { GmailContext, Mail, UserProfile } from './GmailContextValue'

const { ipcRenderer } = window.electron // exposed via contextBridge

export const GmailProvider = ({ children }: { children: ReactNode }): React.JSX.Element => {
  const [mails, setMails] = useState<Mail[]>([])
  const [unansweredMails, setUnansweredMails] = useState<Mail[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [loadingMore, setLoadingMore] = useState<boolean>(false)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [totalCount, setTotalCount] = useState<number>(0)
  const [needsLogin, setNeedsLogin] = useState<boolean>(false)
  const [loginInProgress, setLoginInProgress] = useState<boolean>(false)
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined)

  const MAILS_PER_PAGE = 8

  const fetchAll = (): void => {
    setLoading(true)
    setNeedsLogin(false)
    setNextPageToken(undefined)
    setHasMore(true)
    Promise.all([
      ipcRenderer.invoke('gmail:getMails', { maxResults: 3, labelIds: ['INBOX'], query: '' }),
      ipcRenderer.invoke('gmail:getUnansweredMails', {
        maxResults: MAILS_PER_PAGE,
        labelIds: ['INBOX'],
        query: 'category:primary is:unread'
      }),
      ipcRenderer.invoke('gmail:getUserProfile'),
      ipcRenderer.invoke('gmail:getUnansweredMailsCount', {
        labelIds: ['INBOX'],
        query: 'category:primary is:unread'
      })
    ])
      .then(([allData, unansweredData, profileData, countData]) => {
        setMails(allData as Mail[])
        const response = unansweredData as { mails: Mail[]; nextPageToken?: string }
        setUnansweredMails(response.mails)
        setUserProfile(profileData as UserProfile)
        setNextPageToken(response.nextPageToken)
        setHasMore(!!response.nextPageToken)
        setTotalCount(countData as number)
      })
      .catch((err) => {
        if (err && err.message && err.message.includes('invalid_grant')) {
          setNeedsLogin(true)
        }
      })
      .finally(() => setLoading(false))
  }

  const loadMore = (): void => {
    if (loadingMore || !hasMore || !nextPageToken) return

    setLoadingMore(true)

    ipcRenderer
      .invoke('gmail:getUnansweredMails', {
        maxResults: MAILS_PER_PAGE,
        labelIds: ['INBOX'],
        query: 'category:primary is:unread',
        pageToken: nextPageToken
      })
      .then((data) => {
        const response = data as { mails: Mail[]; nextPageToken?: string }
        setUnansweredMails((prev) => [...prev, ...response.mails])
        setNextPageToken(response.nextPageToken)
        setHasMore(!!response.nextPageToken)
      })
      .catch((err) => {
        console.error('Error loading more mails:', err)
      })
      .finally(() => setLoadingMore(false))
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
      setUserProfile(null)
      setNextPageToken(undefined)
      setHasMore(true)
      setLoadingMore(false)
      setTotalCount(0)
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
        userProfile,
        loading,
        loadingMore,
        hasMore,
        totalCount,
        needsLogin,
        loginInProgress,
        refresh: fetchAll,
        loadMore,
        login,
        logout
      }}
    >
      {children}
    </GmailContext.Provider>
  )
}
