import React from 'react'
import FullMail from './FullMail'
import { ResponseMail } from './ResponseMail'
import type { Mail } from '../../hooks/GmailContextValue'
import { useGmail } from '../../hooks/useGmail'
import { AnimatePresence, motion } from 'framer-motion'
import IconArchive from '../ui/icons/IconArchive'
import IconFullscreenEnter from '../ui/icons/IconFullscreenEnter'
import IconFullscreenExit from '../ui/icons/IconFullscreenExit'
import IconChevronLeft from '../ui/icons/IconChevronLeft'
import IconChevronRight from '../ui/icons/IconChevronRight'
import IconZoomIn from '../ui/icons/IconZoomIn'
import IconZoomOut from '../ui/icons/IconZoomOut'
import { useToast } from '../ui/Toast/useToast'

// Extend Window interface for our global function
declare global {
  interface Window {
    responseMailUpdate?: (mailId: string, content: string) => void
  }
}

interface MailViewProps {
  selectedMail: Mail | null
  setSelectedMail: (mail: Mail | null) => void
  onRegisterMailEditingState?: (setEditingState: (isEditing: boolean) => void) => void
  inboxCollapsed?: boolean
  onToggleInbox?: () => void
}

export function MailView({
  selectedMail,
  setSelectedMail,
  onRegisterMailEditingState,
  inboxCollapsed = false,
  onToggleInbox
}: MailViewProps): React.JSX.Element {
  const { removeUnansweredMail, currentView, archiveThread, unarchiveThread } = useGmail()
  const [archiving, setArchiving] = React.useState(false)
  const { getCurrentMails } = useGmail()
  const [mailZoom, setMailZoom] = React.useState(1)
  const { showToast } = useToast()

  const handlePrevMail = (): void => {
    if (!selectedMail) return
    const list = getCurrentMails()
    const idx = list.findIndex((m) => m.id === selectedMail.id)
    if (idx > 0) setSelectedMail(list[idx - 1])
  }

  const handleNextMail = (): void => {
    if (!selectedMail) return
    const list = getCurrentMails()
    const idx = list.findIndex((m) => m.id === selectedMail.id)
    if (idx >= 0 && idx < list.length - 1) setSelectedMail(list[idx + 1])
  }

  const handleRegisterUpdate = (updateFn: (mailId: string, content: string) => void): void => {
    // Store this update function globally so the chat can call it
    window.responseMailUpdate = updateFn
  }

  const handleRegisterEditingState = (setEditingState: (isEditing: boolean) => void): void => {
    // Register this with the parent so it can be passed to chat
    if (onRegisterMailEditingState) {
      onRegisterMailEditingState(setEditingState)
    }
  }

  // Remove mail from list and clear selection after send
  const handleMailSent = (): void => {
    if (selectedMail && selectedMail.id) {
      removeUnansweredMail(selectedMail.id)
      setSelectedMail(null)
    }
  }

  // Handle archiving/unarchiving a thread
  const handleArchiveToggle = async (): Promise<void> => {
    if (!selectedMail?.threadId) return

    try {
      if (archiving) return
      setArchiving(true)
      if (currentView === 'archived') {
        const title = selectedMail.subject || selectedMail.snippet || selectedMail.id || 'mail'
        // Show toast immediately
        showToast({
          title: 'Thread moved',
          description: `Moved “${title}” back to Inbox`,
          duration: 3000,
          variant: 'success'
        })
        await unarchiveThread(selectedMail.threadId)
      } else {
        const threadId = selectedMail.threadId
        const title = selectedMail.subject || selectedMail.snippet || selectedMail.id || 'mail'
        // Show toast immediately with Undo
        showToast({
          title: 'Archived',
          description: `Archived “${title}”`,
          actionLabel: 'Undo',
          onAction: async () => {
            try {
              await unarchiveThread(threadId)
            } catch (e) {
              console.error('Failed to undo archive', e)
            }
          },
          duration: 5000,
          variant: 'archive'
        })
        await archiveThread(threadId)
      }
      setSelectedMail(null)
    } catch (error) {
      console.error('Error toggling archive status:', error)
    } finally {
      setArchiving(false)
    }
  }

  return (
    <div className="flex-1 h-full bg-white overflow-hidden flex flex-col">
      <AnimatePresence mode="wait">
        {selectedMail ? (
          <motion.div
            key={selectedMail.id}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 5 }}
            transition={{ duration: 0, ease: 'easeOut' }}
            className="flex flex-col h-full"
          >
            {/* Sticky Header with Title and Sender */}
            <div className="sticky top-0 bg-white z-10 px-12 pt-16 pb-4 border-b border-gray-100">
              <div className="flex justify-between items-start mb-1.5">
                {/* Left: subject */}
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-secondary text-3xl select-text">
                    {selectedMail.subject}
                  </h2>
                </div>
                {/* Right: two rows of controls */}
                <div className="flex flex-col items-end gap-1">
                  {/* Upper row: prev/next, fullscreen, archive */}
                  <div className="flex items-center gap-1">
                    {(() => {
                      const list = getCurrentMails()
                      const idx = list.findIndex((m) => m.id === selectedMail.id)
                      return idx > 0 ? (
                        <button
                          onClick={handlePrevMail}
                          className="p-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-600"
                          title="Previous mail"
                        >
                          <IconChevronLeft size={20} />
                        </button>
                      ) : null
                    })()}
                    {(() => {
                      const list = getCurrentMails()
                      const idx = list.findIndex((m) => m.id === selectedMail.id)
                      return idx >= 0 && idx < list.length - 1 ? (
                        <button
                          onClick={handleNextMail}
                          className="p-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-600"
                          title="Next mail"
                        >
                          <IconChevronRight size={20} />
                        </button>
                      ) : null
                    })()}
                    <button
                      onClick={onToggleInbox}
                      className={`p-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-600 ${onToggleInbox ? '' : 'cursor-default opacity-50'}`}
                      title={inboxCollapsed ? 'Show inbox' : 'Hide inbox'}
                      disabled={!onToggleInbox}
                    >
                      {inboxCollapsed ? (
                        <IconFullscreenExit size={22} />
                      ) : (
                        <IconFullscreenEnter size={22} />
                      )}
                    </button>
                    {currentView === 'archived' ? (
                      <button
                        onClick={handleArchiveToggle}
                        className={`ml-1 px-4 py-2 bg-gray-100 ${archiving ? '' : 'hover:bg-gray-200'} text-gray-700 text-sm font-medium rounded-lg transition-colors ${archiving ? 'opacity-60 cursor-not-allowed' : ''}`}
                        title="Unarchive thread"
                        disabled={archiving}
                      >
                        Unarchive
                      </button>
                    ) : (
                      <button
                        onClick={handleArchiveToggle}
                        className={`ml-1 p-3 rounded-lg transition-colors ${archiving ? '' : 'hover:bg-gray-100'} text-gray-600 ${archiving ? '' : 'hover:text-prim'} ${archiving ? 'opacity-60 cursor-not-allowed' : ''}`}
                        title="Archive thread"
                        disabled={archiving}
                      >
                        <IconArchive filled={false} size={24} />
                      </button>
                    )}
                  </div>
                  {/* Lower row: zoom out, percentage, zoom in */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <button
                      onClick={() =>
                        setMailZoom((z) => Math.max(0.8, Math.round((z - 0.1) * 10) / 10))
                      }
                      className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                      title="Zoom out"
                    >
                      <IconZoomOut size={16} />
                    </button>
                    <span className="min-w-[3ch] text-center">{Math.round(mailZoom * 100)}%</span>
                    <button
                      onClick={() =>
                        setMailZoom((z) => Math.min(2, Math.round((z + 0.1) * 10) / 10))
                      }
                      className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                      title="Zoom in"
                    >
                      <IconZoomIn size={16} />
                    </button>
                  </div>
                </div>
                {/* end Right-side controls */}
              </div>
              <div className="text-lg text-third mb-3">
                {selectedMail.from?.replace(/\s*<[^>]+>/, '').trim()}
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-12">
              <FullMail {...selectedMail} zoom={mailZoom} />
              <ResponseMail
                mail={selectedMail}
                onRegisterUpdate={handleRegisterUpdate}
                onRegisterEditingState={handleRegisterEditingState}
                onSent={handleMailSent}
              />
              <div className="pb-8" />
            </div>
          </motion.div>
        ) : (
          <></>
        )}
      </AnimatePresence>
    </div>
  )
}
