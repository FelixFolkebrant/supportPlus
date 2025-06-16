import React from 'react'
import MailPreview from './MailPreview'
import { useGmail } from '../hooks/useGmail'
import { Mail } from '../hooks/GmailContextValue'

interface MailWindowProps {
  selectedMail: Mail | null
  setSelectedMail: (mail: Mail) => void
}

export default function MailWindow({
  selectedMail,
  setSelectedMail
}: MailWindowProps): React.ReactElement {
  const { unansweredMails, loading } = useGmail()

  return (
    <div className="pr-3 pl-10 py-10 h-full flex gap-8">
      <ul className="flex flex-col gap-3">
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
    </div>
  )
}
