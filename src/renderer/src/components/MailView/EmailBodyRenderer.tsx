import React from 'react'
import EmailHtmlViewer from '@renderer/components/MailView/EmailHtmlViewer'

interface EmailBodyRendererProps {
  body?: string
  isHtml?: boolean
  className?: string
  messageId?: string
}

const EmailBodyRenderer: React.FC<EmailBodyRendererProps> = ({
  body,
  isHtml = false,
  className = '',
  messageId
}) => {
  if (!body) return null

  if (isHtml) {
    // Render HTML content inside a sandboxed iframe with sanitization and isolation
    return <EmailHtmlViewer html={body} className={className} messageId={messageId} />
  }

  // Render plain text with preserved formatting
  return <div className={`whitespace-pre-line ${className}`}>{body}</div>
}

export default EmailBodyRenderer
