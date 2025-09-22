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

async function getMyEmail(gmail: gmail_v1.Gmail): Promise<string> {
  const profile = await gmail.users.getProfile({ userId: 'me' })
  return profile.data.emailAddress?.toLowerCase() ?? ''
}

/**
 * Returns emails where we were the last to reply (waiting for customer response)
 */
export async function getRepliedEmails({
  maxResults = 3,
  labelIds = ['INBOX'],
  query = 'category:primary',
  pageToken = undefined
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
  }>
  nextPageToken?: string
}> {
  const gmail = await getGmailClient()
  const myEmail = await getMyEmail(gmail)
  
  // Get the SupportPlus/Archived label ID to exclude it from results
  let archivedLabelId: string | undefined
  try {
    const labelsResponse = await gmail.users.labels.list({ userId: 'me' })
    const archivedLabel = labelsResponse.data.labels?.find((label) => label.name === 'SupportPlus/Archived')
    archivedLabelId = archivedLabel?.id || undefined
  } catch (error) {
    console.warn('Could not fetch labels for filtering archived emails:', error)
  }

  // Add exclusion of SupportPlus/Archived label to query if it exists
  let finalQuery = query
  if (archivedLabelId) {
    finalQuery = `${query} -label:${archivedLabelId}`
  }

  const { data } = await gmail.users.messages.list({
    userId: 'me',
    maxResults: maxResults * 3, // fetch more to filter
    labelIds,
    q: finalQuery,
    pageToken
  })
  if (!data.messages) return { mails: [], nextPageToken: undefined }

  const threadsChecked = new Set<string>()
  const replied: Array<{
    id?: string
    threadId?: string
    subject?: string
    from?: string
    snippet?: string
    body?: string
    isHtml?: boolean
    date?: string
  }> = []

  for (const msgMeta of data.messages) {
    if (replied.length >= maxResults) break
    if (!msgMeta.threadId) continue
    if (threadsChecked.has(msgMeta.threadId)) continue

    // Get the full thread
    const thread = await gmail.users.threads.get({
      userId: 'me',
      id: msgMeta.threadId,
      format: 'full',
      metadataHeaders: ['From', 'To', 'Subject']
    })

    const messages = thread.data.messages ?? []
    if (messages.length === 0) continue

    // Get the last message in the thread
    const lastMsg = messages[messages.length - 1]
    const lastFrom = header(lastMsg, 'From')?.toLowerCase() ?? ''

    // If the last message IS from me (we replied last), include it
    if (lastFrom.includes(myEmail)) {
      // Get the original message (first in thread that's not from me)
      let originalMsg: gmail_v1.Schema$Message | null = null
      for (const msg of messages) {
        const from = header(msg, 'From')?.toLowerCase() ?? ''
        if (!from.includes(myEmail)) {
          originalMsg = msg
          break
        }
      }

      if (originalMsg) {
        const bodyData = getBody(originalMsg)
        replied.push({
          id: originalMsg.id ?? undefined,
          threadId: msgMeta.threadId ?? undefined,
          subject: header(originalMsg, 'Subject'),
          from: header(originalMsg, 'From'),
          snippet: originalMsg.snippet ?? undefined,
          body: bodyData.content,
          isHtml: bodyData.isHtml,
          date: originalMsg.internalDate ?? undefined
        })
      }
    }
    threadsChecked.add(msgMeta.threadId)
  }

  return {
    mails: replied.slice(0, maxResults),
    nextPageToken: data.nextPageToken || undefined
  }
}

/**
 * Returns the estimated total count of emails where we replied last
 */
export async function getRepliedEmailsCount({
  labelIds = ['INBOX'],
  query = 'category:primary'
}: {
  labelIds?: string[]
  query?: string
} = {}): Promise<number> {
  const gmail = await getGmailClient()
  
  // Get the SupportPlus/Archived label ID to exclude it from results
  let archivedLabelId: string | undefined
  try {
    const labelsResponse = await gmail.users.labels.list({ userId: 'me' })
    const archivedLabel = labelsResponse.data.labels?.find((label) => label.name === 'SupportPlus/Archived')
    archivedLabelId = archivedLabel?.id || undefined
  } catch (error) {
    console.warn('Could not fetch labels for filtering archived emails:', error)
  }

  // Add exclusion of SupportPlus/Archived label to query if it exists
  let finalQuery = query
  if (archivedLabelId) {
    finalQuery = `${query} -label:${archivedLabelId}`
  }

  const { data } = await gmail.users.messages.list({
    userId: 'me',
    maxResults: 1, // We only need the count, not the actual messages
    labelIds,
    q: finalQuery
  })

  return data.resultSizeEstimate || 0
}
