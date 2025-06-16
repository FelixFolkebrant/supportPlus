import React from 'react'
import SvgMailShape from './SvgMailShape'

interface MailPreviewProps {
  subject?: string
  from?: string
  snippet?: string
  active?: boolean
}

const MailPreview: React.FC<MailPreviewProps> = ({ subject, from, snippet, active }) => (
  <li className="relative flex items-stretch w-[450px] h-[120px]">
    {/* SVG background shape */}
    <SvgMailShape className="w-full h-full" active={active} />
    {/* Content overlay */}
    <div className="relative z-10 w-11/12 p-5 flex flex-col justify-center">
      <div className="font-bold text-secondary leading-5">{subject}</div>
      <div className="text-secondary leading-5 text-sm">{from}</div>
      <p className="text-xs justify-start max-h-[60px] text-third relative overflow-clip">
        {snippet}
      </p>
    </div>
  </li>
)

export default MailPreview
