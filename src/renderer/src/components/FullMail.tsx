import React from 'react'

interface FullMailProps {
  subject?: string
  body?: string
  from?: string
}

const getNameOnly = (from?: string): string => {
  if (!from) return ''
  return from.replace(/\s*<[^>]+>/, '').trim()
}

const FullMail: React.FC<FullMailProps> = ({ subject, from, body }) => (
  <div className="p-5 rounded bg-stone-50 w-full">
    <h2 className="font-bold text-secondary text-base mb-1.5">{subject}</h2>
    <div className="text-xs text-third mb-3">{getNameOnly(from)}</div>
    <div className="text-sm text-gray-800 whitespace-pre-line">{body}</div>
  </div>
)

export default FullMail
