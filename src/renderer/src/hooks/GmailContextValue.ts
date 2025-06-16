import { createContext } from 'react'

export type Mail = {
  id?: string
  subject?: string
  from?: string
  snippet?: string
}

export interface GmailContextType {
  mails: Mail[]
  unansweredMails: Mail[]
  loading: boolean
  needsLogin: boolean
  loginInProgress: boolean
  refresh: () => void
  login: () => void
  logout: () => void
}

export const GmailContext = createContext<GmailContextType | undefined>(undefined)
