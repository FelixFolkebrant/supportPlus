import React from 'react'
import MailPreview from './MailPreview'
import { useUnansweredMailsContext } from '@renderer/hooks/useUnansweredMailsContext'

export default function MailWindow(): React.ReactElement {
  const { mails = [], loading } = useUnansweredMailsContext()
  return (
    <div className="px-10">
      <ul className="flex flex-col gap-3">
        {Array.isArray(mails) && mails.length > 0 ? (
          mails.map((m) => <MailPreview key={m.id} {...m} />)
        ) : loading ? (
          <li>Loading...</li>
        ) : (
          <li>No mails found.</li>
        )}
      </ul>
    </div>
  )
}
