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

export async function getEmails({
  maxResults = 3,
  labelIds = ['INBOX'],
  query = 'category:primary'
}: {
  maxResults?: number
  labelIds?: string[]
  query?: string
} = {}): Promise<
  Array<{ id?: string; subject?: string; from?: string; snippet?: string; body?: string }>
> {
  const gmail = await getGmailClient()
  const { data } = await gmail.users.messages.list({
    userId: 'me',
    maxResults,
    labelIds,
    q: query
  })
  if (!data.messages) return []
  const details = await Promise.all(
    data.messages.map((m) =>
      gmail.users.messages.get({
        userId: 'me',
        id: m.id!,
        format: 'full' // changed from 'metadata' to 'full'
      })
    )
  )
  return details.map((d) => ({
    id: d.data.id ?? undefined,
    subject: header(d.data, 'Subject'),
    from: header(d.data, 'From'),
    snippet: d.data.snippet ?? undefined,
    body: getBody(d.data)
  }))
}
