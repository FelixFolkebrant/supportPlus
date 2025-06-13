import { useContext } from 'react'
import { UnansweredMailsContext } from './UnansweredMailsContextValue'
import type { UnansweredMailsContextType } from './UnansweredMailsContextValue'

export const useUnansweredMailsContext = (): UnansweredMailsContextType => {
  const ctx = useContext(UnansweredMailsContext)
  if (!ctx) throw new Error('useUnansweredMailsContext must be used within UnansweredMailsProvider')
  return ctx
}
