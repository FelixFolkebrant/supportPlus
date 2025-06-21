import React, { useEffect, useState } from 'react'
import Logo from './Logo'

interface WelcomeScreenProps {
  onLogin: () => void
  loginInProgress: boolean
}

const transitionDuration = 500
const logoTranslateY = 24 // px, logo animates in from below
const logoTranslateYUp = -60 // px, logo moves up for button
const buttonTranslateY = 24 // px, button moves up from below

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onLogin, loginInProgress }) => {
  const [showLogo, setShowLogo] = useState(false)
  const [logoVisible, setLogoVisible] = useState(false)
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    const logoTimer = setTimeout(() => setShowLogo(true), 300)
    return () => clearTimeout(logoTimer)
  }, [])

  useEffect(() => {
    if (showLogo) {
      // Animate logo in
      setTimeout(() => setLogoVisible(true), 10)
      // Animate button in after 3s
      const buttonTimer = setTimeout(() => setShowButton(true), 2000)
      return () => clearTimeout(buttonTimer)
    }
    return undefined
  }, [showLogo])

  return (
    <div className="w-screen h-screen fixed top-0 left-0 z-[9999] bg-white flex flex-col items-center justify-center">
      <style>{`
        .welcome-logo {
          transition: opacity ${transitionDuration}ms cubic-bezier(0.4,0,0.2,1), transform ${transitionDuration}ms cubic-bezier(0.4,0,0.2,1);
        }
        .welcome-login {
          transition: opacity ${transitionDuration}ms cubic-bezier(0.4,0,0.2,1), transform ${transitionDuration}ms cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
      {showLogo && (
        <Logo
          className="welcome-logo"
          style={{
            opacity: logoVisible ? 1 : 0,
            transform: showButton
              ? `translateY(${logoTranslateYUp}px)`
              : logoVisible
                ? 'translateY(0px)'
                : `translateY(${logoTranslateY}px)`
          }}
        />
      )}
      <button
        className="welcome-login mt-8 px-8 py-3 rounded bg-indigo-600 text-white text-lg font-semibold shadow-lg"
        style={{
          opacity: showButton ? 1 : 0,
          transform: showButton ? 'translateY(0px)' : `translateY(${buttonTranslateY}px)`
        }}
        onClick={onLogin}
        disabled={loginInProgress}
      >
        {loginInProgress ? 'Signing in…' : 'Sign in with Google'}
      </button>
    </div>
  )
}

export default WelcomeScreen
