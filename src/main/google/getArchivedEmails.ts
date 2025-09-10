import { gmail_v1 } from 'googleapis'
import { getGmailClient } from './auth'

function header(msg: gmail_v1.Schema$Message, name: string): string {
  return msg.payload?.headers?.find((h) => h.name === name)?.value ?? ''
}

function getBody(msg: gmail_v1.Schema$Message): { content: string; isHtml: boolean } {
  if (!msg.payload) return { content: '', isHtml: false }

  // Prefer plain text part
  if (msg.payload.parts) {
    for (const part of msg.payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return {
          content: Buffer.from(part.body.data, 'base64').toString('utf-8'),
          isHtml: false
        }
      }
    }
    // fallback to HTML part
    for (const part of msg.payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        return {
          content: Buffer.from(part.body.data, 'base64').toString('utf-8'),
          isHtml: true
        }
      }
    }
    // fallback to any part with data
    for (const part of msg.payload.parts) {
      if (part.body?.data) {
        return {
          content: Buffer.from(part.body.data, 'base64').toString('utf-8'),
          isHtml: part.mimeType === 'text/html'
        }
      }
    }
  }
  if (msg.payload.body?.data) {
    return {
      content: Buffer.from(msg.payload.body.data, 'base64').toString('utf-8'),
      isHtml: msg.payload.mimeType === 'text/html'
    }
  }
  return { content: '', isHtml: false }
}

/**
 * Returns archived emails (emails with the archived label)
 */
export async function getArchivedEmails({
  maxResults = 3,
  query = 'category:primary',
  pageToken = undefined
}: {
  maxResults?: number
  query?: string
  pageToken?: string
} = {}): Promise<{
  mails: Array<{
    id?: string
    threadId?: string
    subject?: string
    from?: string
    snippet?: string
    body?: string
    isHtml?: boolean
    date?: string
  }>
  nextPageToken?: string
}> {
  const gmail = await getGmailClient()

  // Use the archived label filter
  const { data } = await gmail.users.messages.list({
    userId: 'me',
    maxResults,
    labelIds: [], // Don't include INBOX since archived messages are usually not in INBOX
    q: `${query} label:archived`, // Filter for archived messages
    pageToken
  })

  if (!data.messages) return { mails: [], nextPageToken: undefined }

  const details = await Promise.all(
    data.messages.map((m) =>
      gmail.users.messages.get({
        userId: 'me',
        id: m.id!,
        format: 'full'
      })
    )
  )

  const archived = details.map((d) => {
    const bodyData = getBody(d.data)
    return {
      id: d.data.id ?? undefined,
      threadId: d.data.threadId ?? undefined,
      subject: header(d.data, 'Subject'),
      from: header(d.data, 'From'),
      snippet: d.data.snippet ?? undefined,
      body: bodyData.content,
      isHtml: bodyData.isHtml,
      date: d.data.internalDate ?? undefined
    }
  })

  return {
    mails: archived,
    nextPageToken: data.nextPageToken || undefined
  }
}

/**
 * Returns the estimated total count of archived emails
 */
export async function getArchivedEmailsCount({
  query = 'category:primary'
}: {
  query?: string
} = {}): Promise<number> {
  const gmail = await getGmailClient()
  const { data } = await gmail.users.messages.list({
    userId: 'me',
    maxResults: 1, // We only need the count, not the actual messages
    labelIds: [],
    q: `${query} label:archived`
  })

  return data.resultSizeEstimate || 0
}
