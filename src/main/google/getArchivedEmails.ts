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
 * Returns up to maxResults emails that have been tagged with the "ARCHIVED" label.



/**
 * Returns up to maxResults emails that have been tagged with the "ARCHIVED" label.
 */
export async function getArchivedEmails({
  maxResults = 50,
  pageToken = undefined
}: {
  maxResults?: number
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

  // First, find or create the "SupportPlus/Archived" label
  let archivedLabelId: string
  try {
    const labelsResponse = await gmail.users.labels.list({ userId: 'me' })
    
    // Debug: Log all custom labels to see what exists
    const customLabels = labelsResponse.data.labels?.filter(label => 
      label.name && !label.name.startsWith('CATEGORY_') && !label.name.startsWith('SYSTEM_')
    ) || []
    console.log('Custom labels found:', customLabels.map(l => ({ id: l.id, name: l.name })))
    
    let archivedLabel = labelsResponse.data.labels?.find(
      (label) => label.name === 'SupportPlus/Archived'
    )
    
    // Also check for old ARCHIVED label and clean it up
    const oldArchivedLabel = labelsResponse.data.labels?.find(
      (label) => label.name === 'ARCHIVED'
    )
    if (oldArchivedLabel?.id && !archivedLabel?.id) {
      console.log('Found old ARCHIVED label, migrating to SupportPlus/Archived...')
      // For now, just use the old label to avoid disruption
      // TODO: Migrate emails from old label to new label
      archivedLabel = oldArchivedLabel
    }
    
    if (archivedLabel?.id) {
      archivedLabelId = archivedLabel.id
      console.log(`Using archived label: ${archivedLabel.name} (ID: ${archivedLabelId})`)
    } else {
      // Create the SupportPlus/Archived label if it doesn't exist
      const createLabelResponse = await gmail.users.labels.create({
        userId: 'me',
        requestBody: {
          name: 'SupportPlus/Archived',
          labelListVisibility: 'labelShow',
          messageListVisibility: 'show'
        }
      })
      archivedLabelId = createLabelResponse.data.id!
      console.log(`Created new archived label: SupportPlus/Archived (ID: ${archivedLabelId})`)
    }
  } catch (error) {
    console.error('Error managing SupportPlus/Archived label:', error)
    // If we can't create/access the label, return empty results instead of throwing
    return { mails: [], nextPageToken: undefined }
  }

  // Get messages with the ARCHIVED label
  console.log(`Searching for archived emails with label ID: ${archivedLabelId}`)
  const { data } = await gmail.users.messages.list({
    userId: 'me',
    maxResults,
    labelIds: [archivedLabelId],
    pageToken
  })

  console.log(`Found ${data.messages?.length || 0} archived messages`)
  if (!data.messages) return { mails: [], nextPageToken: undefined }

  const threadsChecked = new Set<string>()
  const archived: Array<{
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

    const lastMsg = messages[messages.length - 1]
    const bodyData = getBody(lastMsg)
    
    archived.push({
      id: lastMsg.id ?? undefined,
      threadId: msgMeta.threadId ?? undefined,
      subject: header(lastMsg, 'Subject'),
      from: header(lastMsg, 'From'),
      snippet: lastMsg.snippet ?? undefined,
      body: bodyData.content,
      isHtml: bodyData.isHtml,
      date: lastMsg.internalDate ?? undefined
    })

    threadsChecked.add(msgMeta.threadId)
  }

  return {
    mails: archived,
    nextPageToken: data.nextPageToken || undefined
  }
}

/**
 * Returns the estimated total count of archived emails
 */
export async function getArchivedEmailsCount(): Promise<number> {
  const gmail = await getGmailClient()
  
  // Find the SupportPlus/Archived label
  try {
    const labelsResponse = await gmail.users.labels.list({ userId: 'me' })
    const archivedLabel = labelsResponse.data.labels?.find((label) => label.name === 'SupportPlus/Archived')
    
    if (!archivedLabel?.id) {
      return 0 // No SupportPlus/Archived label means no archived emails
    }

    const { data } = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 1, // We only need the count, not the actual messages
      labelIds: [archivedLabel.id]
    })

    return data.resultSizeEstimate || 0
  } catch (error) {
    console.error('Error counting archived emails:', error)
    return 0
  }
}
