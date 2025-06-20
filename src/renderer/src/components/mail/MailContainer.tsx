import type React from 'react'
import MailWindow from './MailWindow'
import FullMail from './FullMail'
import { ResponseMail } from './ResponseMail'
import type { Mail } from '../../hooks/GmailContextValue'

interface MailContainerProps {
  selectedMail: Mail | null
  setSelectedMail: (mail: Mail | null) => void
}

export function MailContainer({
  selectedMail,
  setSelectedMail
}: MailContainerProps): React.JSX.Element {
  return (
    <div className="flex h-full w-full">
      {/* Left: MailWindow grows to content */}
      <div className="flex-none xl:flex hidden border-r border-gray-200 bg-white h-full px-4 py-2">
        <MailWindow selectedMail={selectedMail} setSelectedMail={setSelectedMail} />
      </div>

      {/* Middle: FullMail takes remaining space */}
      <div className="flex-1 overflow-auto bg-stone-50">
        {selectedMail ? (
          <>
            <FullMail {...selectedMail} />
            <ResponseMail mail={selectedMail} />
          </>
        ) : null}
      </div>
    </div>
  )
}
