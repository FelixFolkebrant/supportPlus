import React from 'react'
import SvgMailShape from './SvgMailShape'

interface MailPreviewProps {
  subject?: string
  from?: string
  snippet?: string
  active?: boolean
}

const MailPreview: React.FC<MailPreviewProps> = ({ subject, from, snippet, active }) => (
  <li className="relative flex items-stretch w-[500px] h-[120px]">
    {/* SVG background shape */}
    <SvgMailShape className="w-full h-full" active={active} />
    {/* Content overlay */}
    <div className="relative z-10 w-11/12 p-6 flex flex-col justify-center">
      <div className="font-bold text-secondary">{subject}</div>
      <div className="text-secondary text-sm">{from}</div>
      <p className="text-xs text-third mt-2">{snippet}</p>
    </div>
  </li>
)

export default MailPreview
