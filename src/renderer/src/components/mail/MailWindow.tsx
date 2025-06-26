import React from 'react'
import MailPreview from './MailPreview'
import { useGmail } from '../../hooks/useGmail'
import { Mail } from '../../hooks/GmailContextValue'

interface MailWindowProps {
  selectedMail: Mail | null
  setSelectedMail: (mail: Mail) => void
}

export default function MailWindow({
  selectedMail,
  setSelectedMail
}: MailWindowProps): React.ReactElement {
  const { unansweredMails, loading, refresh } = useGmail()

  return (
    <div className="py-10 h-full flex flex-col gap-8">
      <ul className="flex flex-col gap-3 flex-1">
        {Array.isArray(unansweredMails) && unansweredMails.length > 0 ? (
          unansweredMails.map((m) => (
            <div key={m.id} onClick={() => setSelectedMail(m)} className="cursor-pointer">
              <MailPreview {...m} active={selectedMail?.id === m.id} />
            </div>
          ))
        ) : loading ? (
          <li>Loading...</li>
        ) : (
          <li>No mails found.</li>
        )}
      </ul>
      <div className="flex flex-col items-center gap-2 mt-4">
        <span className="text-sm text-gray-600">Total mails: {unansweredMails.length}</span>
        <button
          onClick={refresh}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {loading ? 'Refreshing...' : 'Refresh mails'}
        </button>
      </div>
    </div>
  )
}
