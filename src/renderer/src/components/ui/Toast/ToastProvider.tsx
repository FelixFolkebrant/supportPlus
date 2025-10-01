import React, { useCallback, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import IconClose from '../icons/IconClose'
import IconInfo from '../icons/IconInfo'
import IconArchive from '../icons/IconArchive'
import { Toast, ToastContext } from './ToastContext'

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timers.current[id]
    if (timer) {
      clearTimeout(timer)
      delete timers.current[id]
    }
  }, [])

  const showToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).slice(2)
      const full: Toast = { id, duration: 3500, ...toast }
      setToasts((prev) => [...prev, full])

      if (full.duration && full.duration > 0) {
        timers.current[id] = setTimeout(() => dismissToast(id), full.duration)
      }

      return { id, dismiss: () => dismissToast(id) }
    },
    [dismissToast]
  )

  const value = useMemo(() => ({ showToast, dismissToast }), [showToast, dismissToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container fixed at bottom center */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-4 p-6">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="pointer-events-auto w-full max-w-3xl rounded-2xl bg-white text-gray-900 shadow-2xl ring-1 ring-black/5"
              role="status"
              aria-live="polite"
            >
              <div className="relative flex items-stretch overflow-hidden rounded-2xl">
                {/* Accent bar */}
                <div
                  className={`w-1 sm:w-1.5 ${
                    t.variant === 'success'
                      ? 'bg-emerald-500'
                      : t.variant === 'warning'
                        ? 'bg-amber-500'
                        : t.variant === 'error'
                          ? 'bg-red-500'
                          : t.variant === 'archive'
                            ? 'bg-prim'
                            : 'bg-blue-500'
                  }`}
                />

                {/* Content */}
                <div className="flex flex-1 items-center gap-4 sm:gap-6 px-5 sm:px-6 py-4 sm:py-5">
                  <div
                    className={`shrink-0 rounded-full p-2 sm:p-2.5 ${
                      t.variant === 'success'
                        ? 'bg-emerald-50 text-emerald-600'
                        : t.variant === 'warning'
                          ? 'bg-amber-50 text-amber-600'
                          : t.variant === 'error'
                            ? 'bg-red-50 text-red-600'
                            : t.variant === 'archive'
                              ? 'bg-prim/10 text-prim'
                              : 'bg-blue-50 text-blue-600'
                    }`}
                    aria-hidden
                  >
                    {t.variant === 'archive' ? <IconArchive size={22} /> : <IconInfo size={22} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-lg sm:text-xl font-semibold leading-tight text-gray-900">
                          {t.title || 'Did you know?'}
                        </div>
                        <div className="mt-1 text-base sm:text-lg text-gray-600 leading-relaxed truncate">
                          {t.description || t.message}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {t.onAction && t.actionLabel ? (
                          <button
                            className="rounded-md bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-medium px-3 py-2"
                            onClick={() => {
                              try {
                                t.onAction?.()
                              } finally {
                                dismissToast(t.id)
                              }
                            }}
                          >
                            {t.actionLabel}
                          </button>
                        ) : null}
                        <button
                          className="rounded-md p-2 text-gray-400 hover:text-gray-600"
                          onClick={() => dismissToast(t.id)}
                          aria-label="Close"
                        >
                          <IconClose size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
