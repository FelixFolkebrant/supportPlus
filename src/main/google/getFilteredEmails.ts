import { gmail_v1 } from 'googleapis'
import { getGmailClient } from './auth'

function header(msg: gmail_v1.Schema$Message, name: string): string {
  return msg.payload?.headers?.find((h) => h.name === name)?.value ?? ''
}

function getBody(msg: gmail_v1.Schema$Message): string {
  if (!msg.payload) return ''
  // Prefer plain text part
  if (msg.payload.parts) {
    for (const part of msg.payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return Buffer.from(part.body.data, 'base64').toString('utf-8')
      }
    }
    // fallback to any part with data
    for (const part of msg.payload.parts) {
      if (part.body?.data) {
        return Buffer.from(part.body.data, 'base64').toString('utf-8')
      }
    }
  }
  if (msg.payload.body?.data) {
    return Buffer.from(msg.payload.body.data, 'base64').toString('utf-8')
  }
  return ''
}

/**
 * Gets the date range for "this week" filter
 * Returns the date in Gmail search format (YYYY/MM/DD)
 */
function getThisWeekDateRange(): { after: string; before: string } {
  const now = new Date()
  const startOfWeek = new Date(now)
  
  // Get Monday of current week
  const dayOfWeek = now.getDay()
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  startOfWeek.setDate(now.getDate() + diffToMonday)
  startOfWeek.setHours(0, 0, 0, 0)
  
  // Get end of current week (Sunday)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)
  
  const formatDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}/${month}/${day}`
  }
  
  return {
    after: formatDate(startOfWeek),
    before: formatDate(endOfWeek)
  }
}

export async function getFilteredEmails({
  maxResults = 8,
  labelIds = ['INBOX'],
  baseQuery = 'category:primary',
  sortFilter = 'all',
  pageToken
}: {
  maxResults?: number
  labelIds?: string[]
  baseQuery?: string
  sortFilter?: 'all' | 'unread-only' | 'this-week'
  pageToken?: string
} = {}): Promise<{
  mails: Array<{
    id?: string
    threadId?: string
    subject?: string
    from?: string
    snippet?: string
    body?: string
    date?: string
    isUnread?: boolean
  }>
  nextPageToken?: string
}> {
  const gmail = await getGmailClient()
  
  // Build the query based on sort filter
  let query = baseQuery
  
  switch (sortFilter) {
    case 'unread-only':
      query = `${baseQuery} is:unread`
      break
    case 'this-week': {
      const { after, before } = getThisWeekDateRange()
      query = `${baseQuery} after:${after} before:${before}`
      break
    }
    case 'all':
    default:
      // Keep the base query as is
      break
  }
  
  // Exclude SupportPlus/Archived by name to avoid an extra labels call
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
        format: 'full'
      })
    )
  )
  
  return {
    mails: details.map((d) => ({
      id: d.data.id ?? undefined,
      threadId: d.data.threadId ?? undefined,
      subject: header(d.data, 'Subject'),
      from: header(d.data, 'From'),
      snippet: d.data.snippet ?? undefined,
      body: getBody(d.data),
      date: d.data.internalDate ?? undefined,
      isUnread: d.data.labelIds?.includes('UNREAD') ?? false
    })),
    nextPageToken: data.nextPageToken || undefined
  }
}