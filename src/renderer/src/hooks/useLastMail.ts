// src/renderer/useLastMail.ts
import { useEffect, useState } from 'react'
const { ipcRenderer } = window.electron // exposed via contextBridge

export function useLastMails() {
  const [mails, setMails] = useState<
    { id?: string; subject?: string; from?: string; snippet?: string }[]
  >([])

  useEffect(() => {
    ipcRenderer.invoke('gmail:getLast3').then(setMails)
  }, [])

  return mails
}


