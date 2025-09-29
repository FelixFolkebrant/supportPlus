import React, { useEffect, useRef, useCallback, useState } from 'react'
import MailPreview from './MailPreview'
import SortDropdown from './SortDropdown'
import SearchInput from './SearchInput'
import { useGmail } from '../../hooks/useGmail'
import { Mail } from '../../hooks/GmailContextValue'
import IconReload from '../ui/icons/IconReload'
import LoadingSpinner from '../ui/LoadingSpinner'

interface MailSelectorProps {
  selectedMail: Mail | null
  setSelectedMail: (mail: Mail) => void
}

export function MailSelector({
  selectedMail,
  setSelectedMail
}: MailSelectorProps): React.ReactElement {
  const [archivingIds, setArchivingIds] = useState<Set<string>>(new Set())
  const {
    getCurrentMails,
    currentView,
    loading,
    loadingMore,
    hasMore,
    refresh,
    loadMore,
    markAsRead,
    sortState,
    searchState
  } = useGmail()
  const currentMails = getCurrentMails()
  const listRef = useRef<HTMLUListElement>(null)

  // Get title based on current view
  const getViewTitle = (): string => {
    switch (currentView) {
      case 'inbox':
        return 'Inbox'
      case 'replied':
        return 'Replied'
      case 'archived':
        return 'Archived'
      case 'settings':
        return 'Settings'
      default:
        return 'Inbox'
    }
  }

  // Get mail count description
  const getMailCountDescription = (): string => {
    const isFiltered = sortState.isActive || searchState.isActive
    if (isFiltered) {
      return `${currentMails.length} filtered mails`
    }
    return `${currentMails.length} mails`
  }

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!listRef.current || loadingMore || !hasMore) return

    const { scrollTop, scrollHeight, clientHeight } = listRef.current
    const threshold = 100 // Load more when 100px from bottom

    if (scrollHeight - scrollTop - clientHeight < threshold) {
      loadMore()
    }
  }, [loadMore, loadingMore, hasMore])

  // Add scroll event listener
  useEffect(() => {
    const listElement = listRef.current
    if (!listElement) return

    listElement.addEventListener('scroll', handleScroll)
    return () => listElement.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Listen for archiving events to trigger fade-out animation
  useEffect(() => {
    const onArchiving = (e: Event): void => {
      const ce = e as CustomEvent<{ threadId?: string }>
      const threadId = ce.detail?.threadId
      if (!threadId) return
      setArchivingIds((prev) => {
        const next = new Set(prev)
        next.add(threadId)
        return next
      })

      // Clear the flag after the animation duration to avoid lingering state
      setTimeout(() => {
        setArchivingIds((prev) => {
          const next = new Set(prev)
          next.delete(threadId)
          return next
        })
      }, 500)
      // Note: no return here; this is an event handler, cleanup is managed in effect cleanup
    }

    window.addEventListener('mail:archiving', onArchiving as EventListener)
    return () => window.removeEventListener('mail:archiving', onArchiving as EventListener)
  }, [])

  return (
    <div className="w-full max-w-xl h-full flex flex-col bg-white shadow-xl border overflow-hidden">
      {/* Mail List */}
      <div className="flex-col items-center px-8 py-8 border-b border-third/20">
        <div className="w-full pb-4 flex justify-between pt-6">
          <div className="flex items-end gap-4">
            <h2 className="text-2xl text-black">{getViewTitle()}</h2>
            <h3 className="text-sm text-third pb-0.5">{getMailCountDescription()}</h3>
          </div>
          <div className="flex items-center gap-3">
            {currentView === 'inbox' && <SortDropdown />}
            <button onClick={refresh} className="text-sm cursor-pointer text-third hover:text-prim">
              <IconReload />
            </button>
          </div>
        </div>
        <SearchInput placeholder="Search emails..." />
      </div>
      <ul ref={listRef} className="flex flex-col flex-1 overflow-y-auto scrollbar-hide bg-white">
        {Array.isArray(currentMails) && currentMails.length > 0 ? (
          <>
            {currentMails.map((m) => (
              <li
                key={m.id}
                className={`rounded-lg transition-all ${
                  selectedMail?.id === m.id
                    ? 'opacity-100'
                    : m.isUnread
                      ? 'opacity-100'
                      : 'opacity-60'
                } hover:opacity-100 ${archivingIds.has(m.threadId || m.id || '') ? 'animate-fade-out' : ''}`}
              >
                <div
                  onClick={() => {
                    setSelectedMail(m)
                    if (m.isUnread && m.id) {
                      void markAsRead(m.id)
                    }
                  }}
                  className="cursor-pointer rounded-lg"
                >
                  <MailPreview {...m} active={selectedMail?.id === m.id} isUnread={m.isUnread} />
                </div>
              </li>
            ))}
            {loadingMore && (
              <li className="flex justify-center py-4">
                <LoadingSpinner size="sm" text="Loading more mails..." color="gray" />
              </li>
            )}
            {!hasMore && currentMails.length > 0 && (
              <li className="flex justify-center py-4 text-gray-400 text-sm">
                <span className="bg-gray-100 px-3 py-1 rounded-full">No more mails to load</span>
              </li>
            )}
          </>
        ) : loading ? (
          <li className="flex flex-col items-center justify-center py-10">
            <LoadingSpinner size="lg" text="Loading mails..." color="blue" />
          </li>
        ) : (
          <li className="flex flex-col items-center justify-center py-10 text-gray-400">
            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            No mails found.
          </li>
        )}
      </ul>
    </div>
  )
}
