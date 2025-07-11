import { createContext } from 'react'

export type Mail = {
  id?: string
  threadId?: string
  subject?: string
  from?: string
  snippet?: string
  body?: string
  isHtml?: boolean
  date?: string // timestamp from Gmail API internalDate
}

export interface UserProfile {
  name: string
  email: string
  picture: string
}

export interface GmailContextType {
  mails: Mail[]
  unansweredMails: Mail[]
  userProfile: UserProfile | null
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  totalCount: number
  needsLogin: boolean
  loginInProgress: boolean
  refresh: () => void
  loadMore: () => void
  login: () => void
  logout: () => void
  removeUnansweredMail: (mailId: string) => void
}

export const GmailContext = createContext<GmailContextType | undefined>(undefined)
