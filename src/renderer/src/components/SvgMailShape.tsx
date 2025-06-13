import React from 'react'

interface SvgMailShapeProps {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

/**
 * A scalable SVG background shape for mail preview items.
 * Fills its container and allows content overlay via children.
 */
const SvgMailShape: React.FC<SvgMailShapeProps> = ({ className, style, children }) => (
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
    <path
      d="M0 20C0 8.95431 8.9543 0 20 0H557.082C564.425 0 571.177 4.0239 574.672 10.4821L603.35 63.4821C606.563 69.4206 606.563 76.5794 603.35 82.5179L574.672 135.518C571.177 141.976 564.425 146 557.082 146H20C8.95431 146 0 137.046 0 126V20Z"
      fill="#E6EAFA"
    />
    {children}
  </svg>
)

export default SvgMailShape
