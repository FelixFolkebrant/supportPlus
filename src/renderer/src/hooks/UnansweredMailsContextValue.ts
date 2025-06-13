import { createContext } from 'react'
import type { Mail } from './UnansweredMailsContext'

export interface UnansweredMailsContextType {
  mails: Mail[]
  refresh: () => void
  loading: boolean
}

export const UnansweredMailsContext = createContext<UnansweredMailsContextType | undefined>(
  undefined
)
