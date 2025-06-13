import { gmail_v1 } from 'googleapis'
import { getGmailClient } from './auth'

function header(msg: gmail_v1.Schema$Message, name: string) {
  return msg.payload?.headers?.find((h) => h.name === name)?.value ?? ''
}

async function getMyEmail(gmail: gmail_v1.Gmail): Promise<string> {
  const profile = await gmail.users.getProfile({ userId: 'me' })
  return profile.data.emailAddress?.toLowerCase() ?? ''
}

/**
 * Returns up to maxResults emails in INBOX where the last message in the thread is NOT from the user.
 */
export async function getUnansweredEmails({
  maxResults = 3,
  labelIds = ['INBOX'],
  query = 'category:primary'
}: {
  maxResults?: number
  labelIds?: string[]
  query?: string
} = {}): Promise<Array<{ id?: string; subject?: string; from?: string; snippet?: string }>> {
  const gmail = await getGmailClient()
  const myEmail = await getMyEmail(gmail)
  const { data } = await gmail.users.messages.list({
    userId: 'me',
    maxResults: maxResults * 3, // fetch more to filter
    labelIds,
    q: query
  })
  if (!data.messages) return []

  const threadsChecked = new Set<string>()
  const unanswered: Array<{ id?: string; subject?: string; from?: string; snippet?: string }> = []

  for (const msgMeta of data.messages) {
    if (unanswered.length >= maxResults) break
    if (!msgMeta.threadId) continue
    if (threadsChecked.has(msgMeta.threadId)) continue

    // Get the full thread
    const thread = await gmail.users.threads.get({
      userId: 'me',
      id: msgMeta.threadId,
      format: 'metadata',
      metadataHeaders: ['From', 'To', 'Subject']
    })

    const messages = thread.data.messages ?? []
    if (messages.length === 0) continue

    const lastMsg = messages[messages.length - 1]
    const lastFrom = header(lastMsg, 'From')?.toLowerCase() ?? ''

    // If the last message is NOT from me, include it
    if (!lastFrom.includes(myEmail)) {
      unanswered.push({
        id: lastMsg.id ?? undefined,
        subject: header(lastMsg, 'Subject'),
        from: header(lastMsg, 'From'),
        snippet: lastMsg.snippet ?? undefined
      })
    }
    threadsChecked.add(msgMeta.threadId)
  }

  return unanswered.slice(0, maxResults)
}
