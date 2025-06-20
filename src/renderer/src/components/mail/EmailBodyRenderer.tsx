import React from 'react'

interface EmailBodyRendererProps {
  body?: string
  isHtml?: boolean
  className?: string
}

const EmailBodyRenderer: React.FC<EmailBodyRendererProps> = ({
  body,
  isHtml = false,
  className = ''
}) => {
  if (!body) return null

  if (isHtml) {
    // Render HTML content safely
    return (
      <div
        className={`email-html-content ${className}`}
        dangerouslySetInnerHTML={{ __html: body }}
      />
    )
  }

  // Render plain text with preserved formatting
  return <div className={`whitespace-pre-line ${className}`}>{body}</div>
}

export default EmailBodyRenderer
