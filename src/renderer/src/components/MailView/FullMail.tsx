import React from 'react'
import EmailBodyRenderer from './EmailBodyRenderer'

interface FullMailProps {
  id?: string
  subject?: string
  body?: string
  from?: string
  isHtml?: boolean
}

const FullMail: React.FC<FullMailProps> = ({ id, body, isHtml = false }) => (
  <div className="pt-4 rounded select-text w-full">
    <EmailBodyRenderer
      body={body}
      isHtml={isHtml}
      messageId={id}
      className="text-base text-gray-800"
    />
  </div>
)

export default FullMail
