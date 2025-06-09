import { gmail_v1 } from 'googleapis'
import { getGmailClient } from './auth'

function header(msg: gmail_v1.Schema$Message, name: string) {
  return msg.payload?.headers?.find((h) => h.name === name)?.value ?? ''
}

export async function getEmails({
  maxResults = 3,
  labelIds = ['INBOX'],
  query = 'category:primary'
}: {
  maxResults?: number
  labelIds?: string[]
  query?: string
} = {}): Promise<Array<{ id?: string; subject?: string; from?: string; snippet?: string }>> {
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
        format: 'metadata',
        metadataHeaders: ['From', 'Subject']
      })
    )
  )
  return details.map((d) => ({
    id: d.data.id ?? undefined,
    subject: header(d.data, 'Subject'),
    from: header(d.data, 'From'),
    snippet: d.data.snippet ?? undefined
  }))
}
