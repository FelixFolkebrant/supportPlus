import { createContext } from 'react'

export type Toast = {
  id: string
  message?: string
  duration?: number // ms
  actionLabel?: string
  onAction?: () => void
  // Optional richer content and visual variant
  title?: string
  description?: string
  variant?: 'info' | 'success' | 'warning' | 'error' | 'archive'
}

export type ToastContextType = {
  showToast: (toast: Omit<Toast, 'id'>) => { id: string; dismiss: () => void }
  dismissToast: (id: string) => void
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined)
