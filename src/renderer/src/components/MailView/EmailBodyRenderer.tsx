import React from 'react'
import EmailHtmlViewer from '@renderer/components/MailView/EmailHtmlViewer'

interface EmailBodyRendererProps {
  body?: string
  isHtml?: boolean
  className?: string
  messageId?: string
  zoom?: number
}

const EmailBodyRenderer: React.FC<EmailBodyRendererProps> = ({
  body,
  isHtml = false,
  className = '',
  messageId,
  zoom = 1
}) => {
  if (!body) return null

  if (isHtml) {
    // Render HTML content inside a sandboxed iframe with sanitization and isolation
    return <EmailHtmlViewer html={body} className={className} messageId={messageId} zoom={zoom} />
  }

  // Render plain text with preserved formatting; scale via font-size to keep layout flow
  return (
    <div
      className={`whitespace-pre-line ${className}`}
      style={{ fontSize: `calc(1rem * ${zoom})` }}
    >
      {body}
    </div>
  )
}

export default EmailBodyRenderer
