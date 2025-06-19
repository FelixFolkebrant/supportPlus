import { useState, useEffect } from 'react'
import { GmailProvider } from './hooks/GmailContext'
import MailWindow from './components/MailWindow'
import FullMail from './components/FullMail'
import LoadingScreen from './components/LoadingScreen'
import LoginScreen from './components/LoginScreen'
import type { Mail } from './hooks/GmailContextValue'
import { useGmail } from './hooks/useGmail'
import type React from 'react'
import { ChatWindow } from './components/chat/ChatWindow'
import { ChatInput } from './components/chat/ChatInput'
import { PersonalitySelector } from './components/chat/PersonalitySelector'
import { PERSONALITIES, Personality } from './api/personalities'
import { ChatMessage } from './api/chat'

function MailAppContent(): React.JSX.Element {
  const { unansweredMails, loading, needsLogin, login, loginInProgress, logout } = useGmail()
  const [selectedMail, setSelectedMail] = useState<Mail | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [personality, setPersonality] = useState<Personality>(PERSONALITIES[0])

  useEffect(() => {
    if (unansweredMails.length > 0) {
      setSelectedMail((prev) => {
        // If prev is not in the new list, select the first
        if (!prev || !unansweredMails.some((m) => m.id === prev.id)) {
          return unansweredMails[0]
        }
        return prev
      })
    } else {
      setSelectedMail(null)
    }
  }, [unansweredMails])

  const handleSend = (): void => {
    if (!chatInput.trim()) return
    setChatMessages((msgs) => [...msgs, { role: 'user', content: chatInput }])
    setChatInput('')
    // Here you would trigger the OpenAI API and update chatMessages with the assistant's reply
  }

  if (loading) return <LoadingScreen />
  if (needsLogin) return <LoginScreen onLogin={login} loginInProgress={loginInProgress} />

  return (
    <div className="h-screen w-screen">
      <div className="flex h-14 items-center justify-between bg-blue-500 text-white text-xl font-bold px-8">
        <span>Navbar?</span>
        <button
          className="px-4 py-2 bg-white text-blue-500 rounded hover:bg-blue-100 font-semibold text-base"
          onClick={logout}
        >
          Log out
        </button>
      </div>

      <div className="flex pl-2 flex-1 h-[calc(100%-3.5rem)] w-full overflow-hidden">
        {/* Left: MailWindow grows to content */}
        <div className="flex-none border-r border-gray-200 bg-white h-full px-4 py-2">
          <MailWindow selectedMail={selectedMail} setSelectedMail={setSelectedMail} />
        </div>

        {/* Middle: FullMail takes remaining space */}
        <div className="flex-1 overflow-auto bg-stone-50">
          {selectedMail ? <FullMail {...selectedMail} /> : null}
        </div>

        {/* Right: Chat panel fixed width */}
        <div className="flex-none w-[400px] border-l border-gray-200 bg-red-500 h-full p-4 overflow-y-auto">
          <PersonalitySelector current={personality} onChange={setPersonality} />
          <ChatWindow messages={chatMessages} personality={personality} loading={false} />
          <ChatInput
            value={chatInput}
            onChange={setChatInput}
            onSend={handleSend}
            loading={false}
          />
        </div>
      </div>
    </div>
  )
}

function App(): React.JSX.Element {
  return (
    <GmailProvider>
      <MailAppContent />
    </GmailProvider>
  )
}

export default App
