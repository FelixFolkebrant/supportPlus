import { gmail_v1 } from 'googleapis'
import { getGmailClient } from './auth'

function walkParts(
  parts: gmail_v1.Schema$MessagePart[] | undefined,
  out: gmail_v1.Schema$MessagePart[] = []
): gmail_v1.Schema$MessagePart[] {
  if (!parts) return out
  for (const p of parts) {
    out.push(p)
    if (p.parts && p.parts.length) walkParts(p.parts, out)
  }
  return out
}

export async function resolveCidImages(messageId: string): Promise<Record<string, string>> {
  const gmail = await getGmailClient()
  const { data } = await gmail.users.messages.get({ userId: 'me', id: messageId, format: 'full' })

  const cidMap: Record<string, string> = {}
  const parts = walkParts(data.payload?.parts)
  for (const part of parts) {
    const headers = part.headers || []
    const cidHeader = headers.find((h) => h.name?.toLowerCase() === 'content-id')?.value
    if (!cidHeader) continue
    const cid = cidHeader.replace(/[<>]/g, '')
    const mimeType = part.mimeType || 'application/octet-stream'
    const attachmentId = part.body?.attachmentId
    if (!attachmentId) continue
    const att = await gmail.users.messages.attachments.get({
      userId: 'me',
      messageId,
      id: attachmentId
    })
    const b64 = att.data.data || ''
    // Gmail returns base64url, replace -_ with +/
    const normalized = b64.replace(/-/g, '+').replace(/_/g, '/')
    cidMap[cid] = `data:${mimeType};base64,${normalized}`
  }
  return cidMap
}
