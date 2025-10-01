import React from 'react'

interface IconProps {
  className?: string
  size?: number
}

export default function IconChevronLeft({
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
      className={`lucide lucide-chevron-left ${className}`}
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}
