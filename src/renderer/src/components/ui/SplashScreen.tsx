import React, { useEffect, useState } from 'react'
import Logo from './Logo'

interface SplashScreenProps {
  show: boolean
  onExited?: () => void
}

const transitionDuration = 500
const translateY = 24 // px

const SplashScreen: React.FC<SplashScreenProps> = ({ show, onExited }) => {
  const [visible, setVisible] = useState(show)
  useEffect(() => {
    if (!show) {
      // Wait for animation to finish before unmounting
      const timeout = setTimeout(() => {
        setVisible(false)
        if (onExited) onExited()
      }, transitionDuration)
      return () => clearTimeout(timeout)
    } else {
      setVisible(true)
      return undefined
    }
  }, [show, onExited])

  if (!visible) return null

  return (
    <div className="w-screen h-screen fixed top-0 left-0 z-[9999] bg-white flex items-center justify-center">
      <style>{`
        .splash-logo-anim {
          transition: opacity ${transitionDuration}ms cubic-bezier(0.4,0,0.2,1), transform ${transitionDuration}ms cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
      <Logo
        className="splash-logo-anim"
        style={{
          opacity: show ? 1 : 0,
          transform: show ? 'translateY(0px)' : `translateY(${translateY}px)`
        }}
      />
    </div>
  )
}

export default SplashScreen
