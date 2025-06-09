import React from 'react'
import { useMails } from '@renderer/hooks/useLastMail'

interface LastThreeProps {
  maxResults?: number
  labelIds?: string[]
  query?: string
}

export default function LastThree({
  maxResults = 3,
  labelIds = ['INBOX'],
  query = 'category:primary'
}: LastThreeProps = {}): JSX.Element {
  const mails = useMails({ maxResults, labelIds, query })
  return (
    <ul className="space-y-2">
      {mails.map((m) => (
        <li key={m.id} className="rounded-2xl shadow p-4 bg-white/80 backdrop-blur">
          <p className="text-sm font-semibold">{m.subject}</p>
          <p className="text-xs text-gray-500">{m.from}</p>
          <p className="text-xs mt-1 line-clamp-2">{m.snippet}</p>
        </li>
      ))}
    </ul>
  )
}
