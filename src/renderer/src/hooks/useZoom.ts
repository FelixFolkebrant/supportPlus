import { useState, useEffect, useCallback } from 'react'

interface UseZoomReturn {
  zoomFactor: number
  zoomPercentage: number
  isLoading: boolean
  setZoom: (factor: number) => Promise<void>
  resetZoom: () => Promise<void>
  zoomIn: () => Promise<void>
  zoomOut: () => Promise<void>
}

export function useZoom(): UseZoomReturn {
  const [zoomFactor, setZoomFactor] = useState<number>(1.0)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize zoom factor
  useEffect(() => {
    const initZoom = async (): Promise<void> => {
      try {
        const currentZoom = await window.api.zoom.get()
        setZoomFactor(currentZoom)
      } catch (error) {
        console.error('Failed to get zoom factor:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initZoom()
  }, [])

  const setZoom = useCallback(async (factor: number) => {
    try {
      setIsLoading(true)
      const newZoom = await window.api.zoom.set(factor)
      setZoomFactor(newZoom)
    } catch (error) {
      console.error('Failed to set zoom factor:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const resetZoom = useCallback(async () => {
    try {
      setIsLoading(true)
      const newZoom = await window.api.zoom.reset()
      setZoomFactor(newZoom)
    } catch (error) {
      console.error('Failed to reset zoom factor:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const zoomIn = useCallback(async () => {
    try {
      setIsLoading(true)
      const newZoom = await window.api.zoom.in()
      setZoomFactor(newZoom)
    } catch (error) {
      console.error('Failed to zoom in:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const zoomOut = useCallback(async () => {
    try {
      setIsLoading(true)
      const newZoom = await window.api.zoom.out()
      setZoomFactor(newZoom)
    } catch (error) {
      console.error('Failed to zoom out:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getZoomPercentage = useCallback(() => {
    return Math.round(zoomFactor * 100)
  }, [zoomFactor])

  return {
    zoomFactor,
    zoomPercentage: getZoomPercentage(),
    isLoading,
    setZoom,
    resetZoom,
    zoomIn,
    zoomOut
  }
}
