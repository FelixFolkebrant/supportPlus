import React, { useContext } from 'react'
import MailPreview from './MailPreview'
import { GmailContext } from '../hooks/GmailContext'

export default function MailWindow(): React.ReactElement {
  const { unansweredMails = [], loading } = useContext(GmailContext) ?? {
    unansweredMails: [],
    loading: false
  }
  return (
    <div className="px-10">
      <ul className="flex flex-col gap-3">
        {Array.isArray(unansweredMails) && unansweredMails.length > 0 ? (
          unansweredMails.map((m) => <MailPreview key={m.id} {...m} />)
        ) : loading ? (
          <li>Loading...</li>
        ) : (
          <li>No mails found.</li>
        )}
      </ul>
    </div>
  )
}
