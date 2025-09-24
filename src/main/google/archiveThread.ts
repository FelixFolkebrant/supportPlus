import { getGmailClient } from './auth'

/**
 * Archives an email thread by adding the "ARCHIVED" label to all messages in the thread
 */
export async function archiveThread(threadId: string): Promise<void> {
  const gmail = await getGmailClient()

  try {
    // First, find or create the "SupportPlus/Archived" label
    let archivedLabelId: string
    const labelsResponse = await gmail.users.labels.list({ userId: 'me' })
    const archivedLabel = labelsResponse.data.labels?.find(
      (label) => label.name === 'SupportPlus/Archived'
    )

    if (archivedLabel?.id) {
      archivedLabelId = archivedLabel.id
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
    }

    // Get the thread to find all message IDs
    const threadResponse = await gmail.users.threads.get({
      userId: 'me',
      id: threadId,
      format: 'minimal'
    })

    const messageIds = threadResponse.data.messages?.map((msg) => msg.id).filter(Boolean) || []

    // Add the ARCHIVED label to each message in the thread
    for (const messageId of messageIds) {
      if (messageId) {
        await gmail.users.messages.modify({
          userId: 'me',
          id: messageId,
          requestBody: {
            addLabelIds: [archivedLabelId]
          }
        })
      }
    }

    console.log(`Successfully archived thread ${threadId} with ${messageIds.length} messages`)
  } catch (error) {
    console.error('Error archiving thread:', error)
    throw new Error(
      `Failed to archive thread: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Unarchives an email thread by removing the "ARCHIVED" label from all messages in the thread
 */
export async function unarchiveThread(threadId: string): Promise<void> {
  const gmail = await getGmailClient()

  try {
    // Find the SupportPlus/Archived label
    const labelsResponse = await gmail.users.labels.list({ userId: 'me' })
    const archivedLabel = labelsResponse.data.labels?.find(
      (label) => label.name === 'SupportPlus/Archived'
    )

    if (!archivedLabel?.id) {
      console.log('SupportPlus/Archived label not found, thread may not be archived')
      return
    }

    // Get the thread to find all message IDs
    const threadResponse = await gmail.users.threads.get({
      userId: 'me',
      id: threadId,
      format: 'minimal'
    })

    const messageIds = threadResponse.data.messages?.map((msg) => msg.id).filter(Boolean) || []

    // Remove the ARCHIVED label from each message in the thread
    for (const messageId of messageIds) {
      if (messageId) {
        await gmail.users.messages.modify({
          userId: 'me',
          id: messageId,
          requestBody: {
            removeLabelIds: [archivedLabel.id]
          }
        })
      }
    }

    console.log(`Successfully unarchived thread ${threadId} with ${messageIds.length} messages`)
  } catch (error) {
    console.error('Error unarchiving thread:', error)
    throw new Error(
      `Failed to unarchive thread: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}
