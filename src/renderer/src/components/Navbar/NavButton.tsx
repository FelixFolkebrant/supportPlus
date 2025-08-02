import React from 'react'

export default function NavButton({
  children,
  active,
  onClick
}: {
  children: React.ReactNode
  active: boolean
  onClick?: () => void
}): React.ReactElement {
  return (
    <div
      className={`h-12 w-16 text-xl text-third flex items-center justify-center ${active ? 'bg-white' : ''} rounded-20 cursor-pointer hover:bg-gray-100 transition-colors`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
