import React from 'react'

interface FullMailProps {
  subject?: string
  from?: string
  snippet?: string
  body?: string
}

const FullMail: React.FC<FullMailProps> = ({ subject, from, snippet, body }) => (
  <div className="p-6 bg-white rounded shadow w-[600px]">
    <h2 className="font-bold text-lg mb-2">{subject}</h2>
    <div className="text-sm text-gray-600 mb-4">From: {from}</div>
    <div className="text-xs text-gray-500 mb-4">{snippet}</div>
    <div className="text-base text-gray-800 whitespace-pre-line">{body}</div>
  </div>
)

export default FullMail
