import { useState, useEffect } from 'react'
import type { Mail } from './GmailContextValue'

interface UseMailSelectionReturn {
  selectedMail: Mail | null
  setSelectedMail: (mail: Mail | null) => void
}

export function useMailSelection(mails: Mail[]): UseMailSelectionReturn {
  const [selectedMail, setSelectedMail] = useState<Mail | null>(null)

  useEffect(() => {
    if (mails.length > 0) {
      setSelectedMail((prev) => {
        // If prev is not in the new list, select the first
        if (!prev || !mails.some((m) => m.id === prev.id)) {
          return mails[0]
        }
        return prev
      })
    } else {
      setSelectedMail(null)
    }
  }, [mails])

  return {
    selectedMail,
    setSelectedMail
  }
}
