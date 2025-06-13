import { createContext } from 'react'
import type { Mail } from './GmailProvider'

export interface GmailContextType {
  mails: Mail[]
  unansweredMails: Mail[]
  loading: boolean
  refresh: () => void
}

export const GmailContext = createContext<GmailContextType | undefined>(undefined)
