import { useEffect } from 'react'
import { useZoom } from './useZoom'

export function useZoomKeyboardShortcuts(): void {
  const { zoomIn, zoomOut, resetZoom } = useZoom()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      // Check for Ctrl/Cmd modifier
      const isModifierPressed = event.ctrlKey || event.metaKey

      if (!isModifierPressed) return

      switch (event.key) {
        case '=':
        case '+':
          event.preventDefault()
          zoomIn()
          break
        case '-':
          event.preventDefault()
          zoomOut()
          break
        case '0':
          event.preventDefault()
          resetZoom()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [zoomIn, zoomOut, resetZoom])
}
