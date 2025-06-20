import React from 'react'
import EmailBodyRenderer from './EmailBodyRenderer'

interface FullMailProps {
  subject?: string
  body?: string
  from?: string
  isHtml?: boolean
}

const getNameOnly = (from?: string): string => {
  if (!from) return ''
  return from.replace(/\s*<[^>]+>/, '').trim()
}

const FullMail: React.FC<FullMailProps> = ({ subject, from, body, isHtml = false }) => (
  <div className="p-5 rounded bg-gray-50 w-full">
    <h2 className="font-bold text-secondary text-3xl mb-1.5">{subject}</h2>
    <div className="text-lg text-third mb-3">{getNameOnly(from)}</div>
    <EmailBodyRenderer body={body} isHtml={isHtml} className="text-base pt-4 text-gray-800" />
  </div>
)

export default FullMail
