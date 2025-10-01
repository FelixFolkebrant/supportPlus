import React from 'react'
import SenderAvatar from '../ui/SenderAvatar'
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
    className={`${active ? 'bg-prim/10' : ''} border-b border-third/20 relative flex items-stretch w-full h-[160px] overflow-hidden`}
  >
    {/* Content overlay */}
    <div
      className={`h-full w-1.5 ${active ? 'bg-prim' : 'bg-transparent'} rounded-r-[20px] shrink-0`}
    ></div>
    <div className="flex-1 min-w-0">
      <div className="relative z-10 w-full p-4 flex flex-col h-full">
        {/* Header: Avatar + (Title + Sender) on the left, time on the right */}
        <div className="flex items-start justify-between w-full gap-3 min-w-0">
          {/* Left group */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {(() => {
              const name = getNameOnly(from)
              const emailMatch = from?.match(/<([^>]+)>/)
              const email = (emailMatch?.[1] || '').toLowerCase()
              return (
                <SenderAvatar
                  name={name}
                  email={email}
                  size={36}
                  className="mt-[2px] shrink-0 rounded-full overflow-hidden"
                />
              )
            })()}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                {typeof isUnread !== 'undefined' && isUnread && (
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                )}
                <div
                  className={`font-medium leading-6 text-xl line-clamp-2 ${
                    active || isUnread ? 'text-black' : 'text-third'
                  }`}
                  title={subject}
                >
                  {subject}
                </div>
              </div>
              <div className="leading-6 text-base text-third truncate">{getNameOnly(from)}</div>
            </div>
          </div>
          {/* Right: time ago */}
          <div
            className={`text-sm whitespace-nowrap ml-2 shrink-0 ${active ? 'text-secondary' : 'text-third'}`}
          >
            {formatTime(date)}
          </div>
        </div>
        {/* Snippet under the grouped header */}
        <p className="text-sm justify-start max-h-[54px] text-third relative overflow-clip mt-1">
          {snippet?.slice(0, 100) + '...'}
        </p>
      </div>
    </div>
  </li>
)

export default MailPreview
