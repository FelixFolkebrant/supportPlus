import React from 'react'
import EmailBodyRenderer from './EmailBodyRenderer'

interface FullMailProps {
  subject?: string
  body?: string
  from?: string
  isHtml?: boolean
}

const FullMail: React.FC<FullMailProps> = ({ body, isHtml = false }) => (
  <div className="pt-4 rounded select-text w-full">
    <EmailBodyRenderer body={body} isHtml={isHtml} className="text-base text-gray-800" />
  </div>
)

export default FullMail
