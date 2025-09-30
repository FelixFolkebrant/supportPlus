import { gmail_v1 } from 'googleapis'
import { getGmailClient } from './auth'

function header(msg: gmail_v1.Schema$Message, name: string): string {
  return msg.payload?.headers?.find((h) => h.name === name)?.value ?? ''
}

function getBody(msg: gmail_v1.Schema$Message): { content: string; isHtml: boolean } {
  if (!msg.payload) return { content: '', isHtml: false }
  // Prefer HTML part
  if (msg.payload.parts) {
    for (const part of msg.payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        return {
          content: Buffer.from(part.body.data, 'base64').toString('utf-8'),
          isHtml: true
        }
      }
    }
    // fallback to plain text part
    for (const part of msg.payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return {
          content: Buffer.from(part.body.data, 'base64').toString('utf-8'),
          isHtml: false
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

export async function getEmails({
  maxResults = 3,
  labelIds = ['INBOX'],
  query = 'category:primary',
  pageToken
}: {
  maxResults?: number
  labelIds?: string[]
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
    isUnread?: boolean
  }>
  nextPageToken?: string
}> {
  const gmail = await getGmailClient()
  // Exclude SupportPlus/Archived by name to avoid an extra labels call. If it doesn't exist, the filter is harmless.
  const finalQuery = `${query} -label:"SupportPlus/Archived"`.trim()
  const { data } = await gmail.users.messages.list({
    userId: 'me',
    maxResults,
    labelIds,
    q: finalQuery,
    pageToken
  })
  if (!data.messages) return { mails: [], nextPageToken: undefined }
  const details = await Promise.all(
    data.messages.map((m) =>
      gmail.users.messages.get({
        userId: 'me',
        id: m.id!,
        format: 'full' // changed from 'metadata' to 'full'
      })
    )
  )
  return {
    mails: details.map((d) => {
      const bodyData = getBody(d.data)
      return {
        id: d.data.id ?? undefined,
        threadId: d.data.threadId ?? undefined,
        subject: header(d.data, 'Subject'),
        from: header(d.data, 'From'),
        snippet: d.data.snippet ?? undefined,
        body: bodyData.content,
        isHtml: bodyData.isHtml,
        date: d.data.internalDate ?? undefined,
        isUnread: d.data.labelIds?.includes('UNREAD') ?? false
      }
    }),
    nextPageToken: data.nextPageToken || undefined
  }
}
