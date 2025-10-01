import React from 'react'

interface IconProps {
  className?: string
  size?: number
}

export default function IconFullscreenExit({
  className = '',
  size = 24
}: IconProps): React.JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`lucide lucide-fullscreen-exit ${className}`}
    >
      <polyline points="9 3 3 3 3 9" />
      <polyline points="21 15 21 21 15 21" />
      <line x1="3" y1="3" x2="10" y2="10" />
      <line x1="21" y1="21" x2="14" y2="14" />
    </svg>
  )
}
