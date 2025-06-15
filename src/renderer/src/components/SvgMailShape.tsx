import React, { useEffect, useRef, useState } from 'react'
import * as flubber from 'flubber'

interface SvgMailShapeProps {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  active?: boolean
}

/**
 * A scalable SVG background shape for mail preview items.
 * Fills its container and allows content overlay via children.
 * Supports morphing between a square and the mail shape using shapeKey (0 to 1).
 */
const SQUARE_PATH = `M0 20
C0 8.95431 8.9543 0 20 0
H548
C559 0 568 8.9543 568 20
V126
C568 137.046 559 146 548 146
H20
C8.95431 146 0 137.046 0 126
V20
Z`
const MAIL_PATH =
  'M0 20C0 8.95431 8.9543 0 20 0H557.082C564.425 0 571.177 4.0239 574.672 10.4821L603.35 63.4821C606.563 69.4206 606.563 76.5794 603.35 82.5179L574.672 135.518C571.177 141.976 564.425 146 557.082 146H20C8.95431 146 0 137.046 0 126V20Z'

const SvgMailShape: React.FC<SvgMailShapeProps> = ({ className, style, children, active }) => {
  const [animatedPath, setAnimatedPath] = useState(active ? MAIL_PATH : SQUARE_PATH)
  const prevActive = useRef(active)

  useEffect(() => {
    if (prevActive.current === active) return
    const from = prevActive.current ? MAIL_PATH : SQUARE_PATH
    const to = active ? MAIL_PATH : SQUARE_PATH
    const interpolator = flubber.interpolate(from, to)
    let frame = 0
    // Fast when activating, slower when deactivating
    const totalFrames = active ? 10 : 20
    // Cubic ease in-out
    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    function animate() {
      frame++
      const t = frame / totalFrames
      setAnimatedPath(interpolator(easeInOutCubic(Math.min(t, 1))))
      if (frame < totalFrames) {
        requestAnimationFrame(animate)
      } else {
        setAnimatedPath(to)
      }
    }
    animate()
    prevActive.current = active
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  const fill = active ? '#E6EAFA' : '#f9f9f9'

  return (
    <svg
      className={className}
      style={{
        width: '100%',
        height: '100%',
        ...style,
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 0
      }}
      viewBox="0 0 606 146"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <path d={animatedPath} fill={fill} />
      {children}
    </svg>
  )
}

export default SvgMailShape
