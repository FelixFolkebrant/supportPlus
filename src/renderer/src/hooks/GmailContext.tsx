import React, { ReactNode, useEffect, useState, useCallback } from 'react'
import { GmailContext, Mail, UserProfile, NavView } from './GmailContextValue'

const { ipcRenderer } = window.electron // exposed via contextBridge

export const GmailProvider = ({ children }: { children: ReactNode }): React.JSX.Element => {
  const [mails, setMails] = useState<Mail[]>([])
  const [unansweredMails, setUnansweredMails] = useState<Mail[]>([])
  const [repliedMails, setRepliedMails] = useState<Mail[]>([])
  const [archivedMails, setArchivedMails] = useState<Mail[]>([])
  const [currentView, setCurrentView] = useState<NavView>('inbox')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [loadingMore, setLoadingMore] = useState<boolean>(false)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [totalCount, setTotalCount] = useState<number>(0)
  const [needsLogin, setNeedsLogin] = useState<boolean>(false)
  const [loginInProgress, setLoginInProgress] = useState<boolean>(false)
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined)

  const MAILS_PER_PAGE = 8

  const fetchAll = useCallback((): void => {
    setLoading(true)
    setNeedsLogin(false)
    setNextPageToken(undefined)
    setHasMore(true)

    const promises = [
      // Fetch a small sample of recent inbox mails for header stats; not used for list
      ipcRenderer.invoke('gmail:getMails', {
        maxResults: 3,
        labelIds: ['INBOX'],
        query: 'category:primary'
      }),
      // For the list, when in inbox, we'll fetch inbox mails below; unanswered remains for counts if needed
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
    ]

    // Add additional promises based on current view
    if (currentView === 'replied') {
      promises.push(
        ipcRenderer.invoke('gmail:getRepliedMails', {
          maxResults: MAILS_PER_PAGE,
          labelIds: ['INBOX'],
          query: 'category:primary'
        })
      )
    } else if (currentView === 'archived') {
      promises.push(
        ipcRenderer.invoke('gmail:getArchivedMails', {
          maxResults: MAILS_PER_PAGE,
          query: 'category:primary'
        })
      )
    } else if (currentView === 'inbox') {
      promises.push(
        ipcRenderer.invoke('gmail:getMails', {
          maxResults: MAILS_PER_PAGE,
          labelIds: ['INBOX'],
          query: 'category:primary'
        })
      )
    }

    Promise.all(promises)
      .then((results) => {
        const [, unansweredData, profileData, countData, additionalData] = results
        // allData is a small sample not used directly for list
        const unansweredResponse = unansweredData as { mails: Mail[]; nextPageToken?: string }
        setUnansweredMails(unansweredResponse.mails)
        setUserProfile(profileData as UserProfile)
        setNextPageToken(unansweredResponse.nextPageToken)
        setHasMore(!!unansweredResponse.nextPageToken)
        setTotalCount(countData as number)

        // Handle additional data based on view
        if (currentView === 'replied' && additionalData) {
          const repliedResponse = additionalData as { mails: Mail[]; nextPageToken?: string }
          setRepliedMails(repliedResponse.mails)
        } else if (currentView === 'archived' && additionalData) {
          const archivedResponse = additionalData as { mails: Mail[]; nextPageToken?: string }
          setArchivedMails(archivedResponse.mails)
        } else if (currentView === 'inbox' && additionalData) {
          const inboxResponse = additionalData as { mails: Mail[]; nextPageToken?: string }
          setMails(inboxResponse.mails)
          setNextPageToken(inboxResponse.nextPageToken)
          setHasMore(!!inboxResponse.nextPageToken)
        }
      })
      .catch((err) => {
        if (err && err.message && err.message.includes('invalid_grant')) {
          setNeedsLogin(true)
        }
      })
      .finally(() => setLoading(false))
  }, [currentView])

  const loadMore = (): void => {
    if (loadingMore || !hasMore || !nextPageToken) return

    setLoadingMore(true)

    let apiCall: Promise<{ mails: Mail[]; nextPageToken?: string }>
    const baseParams = {
      maxResults: MAILS_PER_PAGE,
      pageToken: nextPageToken
    }

    switch (currentView) {
      case 'inbox':
        apiCall = ipcRenderer.invoke('gmail:getMails', {
          ...baseParams,
          labelIds: ['INBOX'],
          query: 'category:primary'
        })
        break
      case 'replied':
        apiCall = ipcRenderer.invoke('gmail:getRepliedMails', {
          ...baseParams,
          labelIds: ['INBOX'],
          query: 'category:primary'
        })
        break
      case 'archived':
        apiCall = ipcRenderer.invoke('gmail:getArchivedMails', {
          ...baseParams,
          query: 'category:primary'
        })
        break
      default:
        setLoadingMore(false)
        return
    }

    apiCall
      .then((data) => {
        const response = data as { mails: Mail[]; nextPageToken?: string }

        switch (currentView) {
          case 'inbox':
            setMails((prev) => [...prev, ...response.mails])
            break
          case 'replied':
            setRepliedMails((prev) => [...prev, ...response.mails])
            break
          case 'archived':
            setArchivedMails((prev) => [...prev, ...response.mails])
            break
        }

        setNextPageToken(response.nextPageToken)
        setHasMore(!!response.nextPageToken)
      })
      .catch((err) => {
        console.error('Error loading more mails:', err)
        if (err && err.message && err.message.includes('invalid_grant')) {
          setNeedsLogin(true)
        }
      })
      .finally(() => setLoadingMore(false))
  }

  const getCurrentMails = (): Mail[] => {
    switch (currentView) {
      case 'inbox':
        return mails
      case 'replied':
        return repliedMails
      case 'archived':
        return archivedMails
      case 'settings':
        return []
      default:
        return unansweredMails
    }
  }

  // Mark a message as read locally in all views
  const markMailReadLocal = (id?: string): void => {
    if (!id) return
    setMails((prev) => prev.map((m) => (m.id === id ? { ...m, isUnread: false } : m)))
    setUnansweredMails((prev) => prev.map((m) => (m.id === id ? { ...m, isUnread: false } : m)))
    setRepliedMails((prev) => prev.map((m) => (m.id === id ? { ...m, isUnread: false } : m)))
    setArchivedMails((prev) => prev.map((m) => (m.id === id ? { ...m, isUnread: false } : m)))
  }

  // Expose helper to mark a message as read via Gmail and update state
  const markAsRead = async (messageId?: string): Promise<void> => {
    if (!messageId) return
    try {
      // Optimistic update
      markMailReadLocal(messageId)
      await ipcRenderer.invoke('gmail:markAsRead', messageId)
    } catch (error) {
      console.error('Failed to mark as read:', error)
      // On failure, refetch to sync state
      fetchAll()
    }
  }

  const handleSetCurrentView = (view: NavView): void => {
    if (view === currentView) return

    setCurrentView(view)
    setNextPageToken(undefined)
    setHasMore(true)
    setLoadingMore(false)

    // Load data for the new view if not already loaded
    if (view === 'replied' && repliedMails.length === 0) {
      setLoading(true)
      ipcRenderer
        .invoke('gmail:getRepliedMails', {
          maxResults: MAILS_PER_PAGE,
          labelIds: ['INBOX'],
          query: 'category:primary'
        })
        .then((data) => {
          const response = data as { mails: Mail[]; nextPageToken?: string }
          setRepliedMails(response.mails)
          setNextPageToken(response.nextPageToken)
          setHasMore(!!response.nextPageToken)
        })
        .catch((err) => {
          console.error('Error loading replied mails:', err)
          if (err && err.message && err.message.includes('invalid_grant')) {
            setNeedsLogin(true)
          }
        })
        .finally(() => setLoading(false))
    } else if (view === 'archived' && archivedMails.length === 0) {
      setLoading(true)
      ipcRenderer
        .invoke('gmail:getArchivedMails', {
          maxResults: MAILS_PER_PAGE,
          query: 'category:primary'
        })
        .then((data) => {
          const response = data as { mails: Mail[]; nextPageToken?: string }
          setArchivedMails(response.mails)
          setNextPageToken(response.nextPageToken)
          setHasMore(!!response.nextPageToken)
        })
        .catch((err) => {
          console.error('Error loading archived mails:', err)
          if (err && err.message && err.message.includes('invalid_grant')) {
            setNeedsLogin(true)
          }
        })
        .finally(() => setLoading(false))
    }
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
      setRepliedMails([])
      setArchivedMails([])
      setUserProfile(null)
      setNextPageToken(undefined)
      setHasMore(true)
      setLoadingMore(false)
      setTotalCount(0)
      setCurrentView('inbox')
    })
  }

  const removeUnansweredMail = (mailId: string): void => {
    setUnansweredMails((prev) => prev.filter((m) => m.id !== mailId))
  }

  const archiveThread = async (threadId: string): Promise<void> => {
    try {
      // Trigger a UI animation for the item in the list before actual removal
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('mail:archiving', { detail: { threadId } }))
      }

      await ipcRenderer.invoke('gmail:archiveThread', threadId)

      // Give the animation a brief moment to play before removing
      await new Promise((resolve) => setTimeout(resolve, 220))

      // Remove the thread from inbox and replied views
      setMails((prev) => prev.filter((m) => m.threadId !== threadId))
      setUnansweredMails((prev) => prev.filter((m) => m.threadId !== threadId))
      setRepliedMails((prev) => prev.filter((m) => m.threadId !== threadId))

      // Refresh archived mails to show the newly archived thread
      const archivedData = await ipcRenderer.invoke('gmail:getArchivedMails', {
        maxResults: MAILS_PER_PAGE
      })
      const archivedResponse = archivedData as { mails: Mail[]; nextPageToken?: string }
      setArchivedMails(archivedResponse.mails)
    } catch (error) {
      console.error('Error archiving thread:', error)
      throw error
    }
  }

  const unarchiveThread = async (threadId: string): Promise<void> => {
    try {
      await ipcRenderer.invoke('gmail:unarchiveThread', threadId)

      // Remove the thread from archived view
      setArchivedMails((prev) => prev.filter((m) => m.threadId !== threadId))

      // Refresh other views to potentially show the unarchived thread
      fetchAll()
    } catch (error) {
      console.error('Error unarchiving thread:', error)
      throw error
    }
  }

  useEffect(() => {
    ipcRenderer.invoke('gmail:hasValidToken').then((valid: boolean) => {
      if (valid) {
        fetchAll()
      } else {
        setNeedsLogin(true)
      }
    })
  }, [fetchAll])

  return (
    <GmailContext.Provider
      value={{
        mails,
        unansweredMails,
        repliedMails,
        archivedMails,
        currentView,
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
        logout,
        removeUnansweredMail,
        setCurrentView: handleSetCurrentView,
        getCurrentMails,
        archiveThread,
        unarchiveThread,
        markAsRead
      }}
    >
      {children}
    </GmailContext.Provider>
  )
}
