import { useContext } from 'react'
import { ToastContext, ToastContextType } from './ToastContext'

export const useToast = (): ToastContextType => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
