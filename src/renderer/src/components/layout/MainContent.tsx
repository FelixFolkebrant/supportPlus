import React, { useRef, useState, useEffect } from 'react'
import { MailContainer } from '../mail/MailContainer'
import { ChatContainer } from '../containers/ChatContainer'
import { useMailSelection } from '../../hooks/useMailSelection'
import { useGmail } from '../../hooks/useGmail'

const MIN_CHAT_WIDTH = 500
const MAX_CHAT_WIDTH = 800

export function MainContent(): React.JSX.Element {
  const { unansweredMails } = useGmail()
  const { selectedMail, setSelectedMail } = useMailSelection(unansweredMails)

  // State for chat panel width
  const [chatWidth, setChatWidth] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return Math.max(MIN_CHAT_WIDTH, Math.min(window.innerWidth * 0.35, MAX_CHAT_WIDTH))
    }
    return 400
  })
  const dragging = useRef(false)

  useEffect(() => {
    function onMouseMove(e: MouseEvent): void {
      if (!dragging.current) return
      // Calculate chat width from the right edge
      const container = document.getElementById('main-content-container')
      if (!container) return
      const rect = container.getBoundingClientRect()
      const newWidth = Math.max(MIN_CHAT_WIDTH, Math.min(rect.right - e.clientX, MAX_CHAT_WIDTH))
      setChatWidth(newWidth)
    }
    function onMouseUp(): void {
      dragging.current = false
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  return (
    <div
      id="main-content-container"
      className="flex pl-2 flex-1 h-[calc(100%-3.5rem)] w-full overflow-hidden"
    >
      <div className="flex-1 h-full min-w-0">
        <MailContainer selectedMail={selectedMail} setSelectedMail={setSelectedMail} />
      </div>
      {/* Divider */}
      <div
        style={{ cursor: 'col-resize', width: 6, margin: '0 2px', zIndex: 10 }}
        className="bg-gray-200 hover:bg-gray-300 active:bg-gray-400 transition-colors h-full"
        onMouseDown={() => {
          dragging.current = true
        }}
        role="separator"
        aria-orientation="vertical"
        tabIndex={0}
      />
      <div
        style={{ width: chatWidth, minWidth: MIN_CHAT_WIDTH, maxWidth: MAX_CHAT_WIDTH }}
        className="h-full flex-shrink-0"
      >
        <ChatContainer selectedMail={selectedMail} />
      </div>
    </div>
  )
}
