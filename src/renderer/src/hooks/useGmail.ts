import { useContext } from 'react'
import { GmailContext } from './GmailContextValue'
import type { GmailContextType } from './GmailContextValue'

export const useGmail = (): GmailContextType => {
  const ctx = useContext(GmailContext)
  if (!ctx) throw new Error('useGmail must be used within GmailProvider')
  return ctx
}
