import React from 'react'
// import SvgMailShape from './SvgMailShape'

interface MailPreviewProps {
  subject?: string
  from?: string
  snippet?: string
  active?: boolean
  date?: string
  isUnread?: boolean
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

const MailPreview: React.FC<MailPreviewProps> = ({
  subject,
  from,
  active,
  date,
  snippet,
  isUnread
}) => (
  <li
    className={`${active ? 'bg-prim/10' : ''} border-b border-third/20 relative flex items-start w-full h-[160px]`}
  >
    {/* Content overlay */}
    <div className={`h-full w-1.5 ${active ? 'bg-prim' : 'bg-transparent'} rounded-r-[20px]`}></div>
    <div>
      <div className="relative z-10 w-full p-4 flex flex-col h-full">
        <div className="flex flex-row items-center justify-between w-full relative">
          {/* Unread blue dot positioned relative to the title line */}
          {typeof isUnread !== 'undefined' && isUnread && (
            <span
              className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500"
              style={{ opacity: 1 }}
            />
          )}
          <div
            className={`font-medium pt-1 leading-6 text-xl max-w-5/6 pl-4 ${
              active || isUnread ? 'text-black' : 'text-third'
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
        <div className={`leading-7 pb-2 text-base mt-1 text-third`}>{getNameOnly(from)}</div>
        <p className="text-sm justify-start max-h-[54px] text-third relative overflow-clip">
          {snippet?.slice(0, 100) + '...'}
        </p>
      </div>
    </div>
  </li>
)

export default MailPreview
