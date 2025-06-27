import React from 'react'
import SvgMailShape from './SvgMailShape'

interface MailPreviewProps {
  subject?: string
  from?: string
  snippet?: string
  active?: boolean
  date?: string
}

const getNameOnly = (from?: string): string => {
  if (!from) return ''
  return from.replace(/\s*<[^>]+>/, '').trim()
}

const formatTime = (date?: string): string => {
  if (!date) return ''

  const timestamp = parseInt(date, 10)
  const now = Date.now()
  const diffMs = now - timestamp

  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 60) {
    return `${diffMinutes} min${diffMinutes !== 1 ? 's' : ''}`
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`
  } else {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`
  }
}

const MailPreview: React.FC<MailPreviewProps> = ({ subject, from, active, date }) => (
  <li className="relative flex items-center w-[450px] h-[120px]">
    {/* SVG background shape */}
    <SvgMailShape className="w-full h-full" active={active} />
    {/* Content overlay */}
    <div className="relative z-10 w-full p-4 flex flex-col h-full">
      <div className="flex flex-row items-center justify-between w-full">
        <div
          className={`font-medium leading-5 text-xl max-w-5/6 ${
            active ? 'text-black' : 'text-third'
          }`}
        >
          {subject}
        </div>
        <div
          className={`text-sm whitespace-nowrap ml-6 relative right-5 ${
            active ? 'text-secondary' : 'text-third'
          }`}
        >
          {formatTime(date)}
        </div>
      </div>
      <div className={`leading-7 text-base mt-1 ${active ? 'text-secondary' : 'text-third'}`}>
        {getNameOnly(from)}
      </div>
      {/* <p className="text-sm justify-start max-h-[54px] text-third relative overflow-clip">
        {snippet?.slice(0, 100) + '...'}
      </p> */}
    </div>
  </li>
)

export default MailPreview
