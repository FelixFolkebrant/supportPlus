import React from 'react'

interface IconProps {
  className?: string
  size?: number
}

export default function IconChevronRight({
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
      className={`lucide lucide-chevron-right ${className}`}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}
