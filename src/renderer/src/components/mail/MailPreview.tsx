import React from 'react'
import SvgMailShape from './SvgMailShape'

interface MailPreviewProps {
  subject?: string
  from?: string
  snippet?: string
  active?: boolean
}

const getNameOnly = (from?: string): string => {
  if (!from) return ''
  return from.replace(/\s*<[^>]+>/, '').trim()
}

const MailPreview: React.FC<MailPreviewProps> = ({ subject, from, snippet, active }) => (
  <li className="relative flex items-stretch w-[405px] h-[108px]">
    {/* SVG background shape */}
    <SvgMailShape className="w-full h-full" active={active} />
    {/* Content overlay */}
    <div className="relative z-10 w-10/12 p-4 flex flex-col items-start">
      <div className="font-bold text-secondary leading-5 text-base">{subject}</div>
      <div className="text-secondary leading-5 text-xs">{getNameOnly(from)}</div>
      <p className="text-[0.65rem] justify-start max-h-[54px] text-third relative overflow-clip">
        {snippet}
      </p>
    </div>
  </li>
)

export default MailPreview
