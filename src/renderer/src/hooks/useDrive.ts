import { useContext } from 'react'
import { DriveContext } from './DriveContext'
import type { DriveContextValue } from './DriveTypes'

export const useDrive = (): DriveContextValue => {
  const context = useContext(DriveContext)
  if (!context) {
    throw new Error('useDrive must be used within a DriveProvider')
  }
  return context
}
