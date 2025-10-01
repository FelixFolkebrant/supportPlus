import React from 'react'
import EmailBodyRenderer from './EmailBodyRenderer'

interface FullMailProps {
  id?: string
  subject?: string
  body?: string
  from?: string
  isHtml?: boolean
  zoom?: number
}

const FullMail: React.FC<FullMailProps> = ({ id, body, isHtml = false, zoom = 1 }) => (
  <div className="pt-4 rounded select-text w-full">
    <EmailBodyRenderer
      body={body}
      isHtml={isHtml}
      messageId={id}
      zoom={zoom}
      className="text-base text-gray-800"
    />
  </div>
)

export default FullMail
