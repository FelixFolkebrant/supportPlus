import React, { useEffect, useRef, useCallback } from 'react'
import MailPreview from './MailPreview'
import { useGmail } from '../../hooks/useGmail'
import { Mail } from '../../hooks/GmailContextValue'

interface MailSelectorProps {
  selectedMail: Mail | null
  setSelectedMail: (mail: Mail) => void
}

export function MailSelector({
  selectedMail,
  setSelectedMail
}: MailSelectorProps): React.ReactElement {
  const { unansweredMails, loading, loadingMore, hasMore, totalCount, refresh, loadMore } =
    useGmail()
  const listRef = useRef<HTMLUListElement>(null)

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

  return (
    <div className="w-full max-w-xl h-full flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
      {/* Mail List */}
      <ul
        ref={listRef}
        className="flex flex-col flex-1 overflow-y-auto scrollbar-hide px-2 py-3 bg-white"
      >
        {Array.isArray(unansweredMails) && unansweredMails.length > 0 ? (
          <>
            {unansweredMails.map((m) => (
              <li
                key={m.id}
                className={`rounded-lg transition-all opacity-60 hover:opacity-100 ${selectedMail?.id === m.id ? 'opacity-100' : ''}`}
              >
                <div onClick={() => setSelectedMail(m)} className="cursor-pointer rounded-lg">
                  <MailPreview {...m} active={selectedMail?.id === m.id} />
                </div>
              </li>
            ))}
            {loadingMore && (
              <li className="flex justify-center py-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Loading more mails...
                </div>
              </li>
            )}
            {!hasMore && unansweredMails.length > 0 && (
              <li className="flex justify-center py-4 text-gray-400 text-sm">
                <span className="bg-gray-100 px-3 py-1 rounded-full">No more mails to load</span>
              </li>
            )}
          </>
        ) : loading ? (
          <li className="flex flex-col items-center justify-center py-10 text-blue-400">
            <svg
              className="w-8 h-8 animate-spin mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Loading mails...
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
