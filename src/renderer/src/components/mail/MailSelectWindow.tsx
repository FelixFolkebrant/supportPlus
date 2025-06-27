import React, { useEffect, useRef, useCallback } from 'react'
import MailPreview from './MailPreview'
import { useGmail } from '../../hooks/useGmail'
import { Mail } from '../../hooks/GmailContextValue'

interface MailWindowProps {
  selectedMail: Mail | null
  setSelectedMail: (mail: Mail) => void
}

export default function MailSelectWindow({
  selectedMail,
  setSelectedMail
}: MailWindowProps): React.ReactElement {
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
    <div className="h-full w-full flex relative items-center justify-center py-8">
      <div className="w-full max-w-xl h-full flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-100 to-blue-50">
          <div className="flex items-center gap-3">
            <svg
              className="w-7 h-7 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-blue-700 tracking-tight">
              Unanswered Mails{' '}
              <span className="text-base font-medium text-blue-400">({totalCount})</span>
            </h2>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        {/* Optional: Search bar for future extensibility */}
        <div className="px-6 py-2 bg-white border-b border-gray-100">
          <input
            type="text"
            placeholder="Search mails (coming soon)"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 bg-gray-50"
            disabled
          />
        </div>
        {/* Mail List */}
        <ul
          ref={listRef}
          className="flex flex-col gap-2 flex-1 overflow-y-auto scrollbar-hide px-2 py-3 bg-white"
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
    </div>
  )
}
