import React from 'react'
import SvgMailShape from './SvgMailShape'

interface MailPreviewProps {
  subject?: string
  from?: string
  snippet?: string
}

const MailPreview: React.FC<MailPreviewProps> = ({ subject, from, snippet }) => (
  <li
    className="relative flex items-stretch max-w-xl min-h-[120px]"
    style={{ aspectRatio: '606/146' }}
  >
    {/* SVG background shape */}
    <SvgMailShape className="w-full h-full" />
    {/* Content overlay */}
    <div className="relative z-10 p-6 flex-1 flex flex-col justify-center">
      <div className="font-bold text-secondary">{subject}</div>
      <div className="text-third">{from}</div>
      <p className="text-xs text-third mt-2">{snippet}</p>
    </div>
  </li>
)

export default MailPreview
