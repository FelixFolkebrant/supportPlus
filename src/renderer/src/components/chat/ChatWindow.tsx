import { ChatMessage } from '../../api/chat'
import { ChatMessageBubble } from './ChatMessageBubble'
import { AnimatePresence, motion } from '../mail/framerMotion'
import React, { useEffect, useRef, useState } from 'react'

type ChatWindowProps = {
  messages: ChatMessage[]
  loading: boolean
  onShowSettingsTab?: () => void
}

export function ChatWindow({
  messages,
  loading,
  onShowSettingsTab
}: ChatWindowProps): React.JSX.Element {
  const showInstruction = messages.length === 0 && !loading

  return (
    <div className="flex-1 flex">
      {showInstruction ? (
        <div className="flex flex-1 items-center justify-center w-full h-full">
          <div className="text-center text-gray-400 p-4 select-none w-full max-w-xl mx-auto">
            This is your <b>Mail Assistant</b>. It can help you create and edit emails based on your
            documents in your{' '}
            <button
              className="underline text-blue-400 hover:text-blue-600 focus:outline-none bg-transparent border-none cursor-pointer p-0 m-0"
              style={{ background: 'none' }}
              onClick={onShowSettingsTab}
            >
              Google Drive Folder
            </button>
            . Add documents (FAQ, instructions, policies) to the folder to improve its answers!
          </div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key="chat-messages"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex-1 overflow-y-auto flex flex-col gap-2 mb-4 w-full"
          >
            {messages.map((msg, i) => {
              // If loading, don't animate the last message (assistant is typing)
              const isLast = i === messages.length - 1
              const shouldAnimate = !(loading && isLast)
              if (shouldAnimate) {
                return (
                  <motion.div
                    key={msg.id ?? i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{
                      duration: 0.25,
                      delay: i * 0.05,
                      ease: 'easeOut'
                    }}
                    layout
                  >
                    <ChatMessageBubble msg={msg} />
                  </motion.div>
                )
              } else {
                return <ChatMessageBubble key={msg.id ?? i} msg={msg} />
              }
            })}
            {loading && <div className="text-left text-gray-400">Assistant is typing...</div>}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
