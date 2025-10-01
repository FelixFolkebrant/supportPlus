import { OAuth2Client } from 'google-auth-library'
import { google, gmail_v1, drive_v3 } from 'googleapis'
import keytar from 'keytar'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'node:crypto'
import { app, shell } from 'electron'

const isPackaged = app.isPackaged

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.labels',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/drive.readonly'
]
const SERVICE_NAME = 'MyElectronMail'
// Legacy single-account storage used ACCOUNT_NAME = 'tokens'. We'll migrate to account-per-email.
const LEGACY_ACCOUNT_NAME = 'tokens'

interface SavedTokens {
  access_token: string
  refresh_token: string
  scope: string
  expiry_date: number
  token_type: string
}

function createPkce(): { codeVerifier: string; codeChallenge: string } {
  const codeVerifier = crypto.randomBytes(32).toString('base64url')
  const hash = crypto.createHash('sha256').update(codeVerifier).digest()
  const codeChallenge = hash.toString('base64url')
  return { codeVerifier, codeChallenge }
}

import express from 'express'
import { createServer, Server } from 'http'

async function getRedirectUriAndServer(): Promise<{
  redirectUri: string
  server: Server
  appServer: express.Express
}> {
  const appServer = express()
  const server = createServer(appServer)
  await new Promise<void>((ok) => server.listen(0, ok))
  const { port } = server.address() as { port: number }
  return { redirectUri: `http://127.0.0.1:${port}`, server, appServer }
}

async function waitForCode(server: Server, appServer: express.Express): Promise<string> {
  return await new Promise((resolve) => {
    appServer.get('/', (req, res) => {
      res.send('<h3>You may now close this window.</h3>')
      resolve(req.query.code as string)
      setImmediate(() => server.close())
    })
  })
}

export async function getGmailClient(scopes: string[] = SCOPES): Promise<gmail_v1.Gmail> {
  // Ensure legacy tokens are migrated once and obtain client for active account
  const { client } = await getOAuthClientForActiveAccount()
  if (client) return google.gmail({ version: 'v1', auth: client })

  // No active account or tokens available: run login flow to add first account
  const newClient = await loginAndStoreNewAccount(scopes)
  return google.gmail({ version: 'v1', auth: newClient })
}

export async function getDriveClient(scopes: string[] = SCOPES): Promise<drive_v3.Drive> {
  const { client } = await getOAuthClientForActiveAccount()
  if (client) return google.drive({ version: 'v3', auth: client })
  const newClient = await loginAndStoreNewAccount(scopes)
  return google.drive({ version: 'v3', auth: newClient })
}

export async function hasValidToken(): Promise<boolean> {
  try {
    const { client } = await getOAuthClientForActiveAccount()
    if (!client) return false
    await client.getAccessToken()
    const gmail = google.gmail({ version: 'v1', auth: client })
    await gmail.users.getProfile({ userId: 'me' })
    return true
  } catch {
    return false
  }
}

export async function logout(): Promise<void> {
  const active = await getActiveAccount()
  if (active) {
    await keytar.deletePassword(SERVICE_NAME, active)
    const accounts = await listAccounts()
    if (accounts.length > 0) {
      await setActiveAccount(accounts[0])
    } else {
      await setActiveAccount(null)
    }
  }
}

export async function sendReply(messageId: string, body: string): Promise<void> {
  const gmail = await getGmailClient()

  // First, get the original message to extract thread info and headers
  const originalMessage = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'full'
  })

  const threadId = originalMessage.data.threadId
  const headers = originalMessage.data.payload?.headers || []
  const originalMessageId = headers.find((h) => h.name === 'Message-ID')?.value || ''

  // Extract necessary headers from the original message
  const originalFrom = headers.find((h) => h.name === 'From')?.value || ''
  const originalSubject = headers.find((h) => h.name === 'Subject')?.value || ''

  // Create reply subject (add RE: if not already present)
  const replySubject = originalSubject.startsWith('RE:')
    ? originalSubject
    : `RE: ${originalSubject}`

  // Prepare the email message as HTML
  const utf8Subject = Buffer.from(replySubject, 'utf-8').toString()
  const messageParts = [
    `To: ${originalFrom}`,
    `Subject: ${utf8Subject}`,
    `In-Reply-To: ${originalMessageId}`,
    `References: ${originalMessageId}`,
    'Content-Type: text/html; charset="UTF-8"',
    '',
    body
  ]

  const message = messageParts.join('\n')
  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  console.log('Sending reply:', {
    threadId,
    messageId,
    to: originalFrom,
    subject: utf8Subject,
    body,
    originalMessageId
  })

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      threadId,
      raw: encodedMessage
    }
  })
}

// ============ Multi-account helpers ============

type Settings = { zoomFactor?: number; activeAccount?: string | null }

async function readSettings(): Promise<Settings> {
  try {
    const userDataPath = app.getPath('userData')
    const settingsPath = path.join(userDataPath, 'settings.json')
    const raw = await fs.readFile(settingsPath, 'utf-8')
    return JSON.parse(raw) as Settings
  } catch {
    return {}
  }
}

async function writeSettings(newSettings: Settings): Promise<void> {
  const userDataPath = app.getPath('userData')
  const settingsPath = path.join(userDataPath, 'settings.json')
  let current: Settings = {}
  try {
    const raw = await fs.readFile(settingsPath, 'utf-8')
    current = JSON.parse(raw) as Settings
  } catch {
    current = {}
  }
  const merged = { ...current, ...newSettings }
  await fs.writeFile(settingsPath, JSON.stringify(merged, null, 2), 'utf-8')
}

async function getClientSecrets(): Promise<{ client_id: string; client_secret: string }> {
  const credsPath = isPackaged
    ? path.join(process.resourcesPath, 'credentials.json')
    : path.join(app.getAppPath(), 'credentials.json')

  const {
    installed: { client_id, client_secret }
  } = JSON.parse(await fs.readFile(credsPath, 'utf-8'))
  return { client_id, client_secret }
}

export async function listAccounts(): Promise<string[]> {
  const creds = await keytar.findCredentials(SERVICE_NAME)
  // Filter out legacy account name
  return creds.filter((c) => c.account && c.account !== LEGACY_ACCOUNT_NAME).map((c) => c.account)
}

export async function getActiveAccount(): Promise<string | null> {
  const settings = await readSettings()
  if (settings.activeAccount) return settings.activeAccount

  // If not set, but accounts exist, set the first as active
  const accounts = await listAccounts()
  if (accounts.length > 0) {
    await setActiveAccount(accounts[0])
    return accounts[0]
  }

  // Try legacy migration
  const migrated = await migrateLegacyToken()
  if (migrated) {
    const updated = await listAccounts()
    if (updated.length > 0) {
      await setActiveAccount(updated[0])
      return updated[0]
    }
  }
  return null
}

export async function setActiveAccount(email: string | null): Promise<void> {
  await writeSettings({ activeAccount: email })
}

async function migrateLegacyToken(): Promise<boolean> {
  const legacyRaw = await keytar.getPassword(SERVICE_NAME, LEGACY_ACCOUNT_NAME)
  if (!legacyRaw) return false

  try {
    const { client_id, client_secret } = await getClientSecrets()
    const client = new OAuth2Client({ clientId: client_id, clientSecret: client_secret })
    client.setCredentials(JSON.parse(legacyRaw) as SavedTokens)
    // Fetch email
    const oauth2 = google.oauth2({ version: 'v2', auth: client })
    const resp = await oauth2.userinfo.get()
    const email = resp.data.email || null
    if (!email) return false
    await keytar.setPassword(SERVICE_NAME, email, legacyRaw)
    await keytar.deletePassword(SERVICE_NAME, LEGACY_ACCOUNT_NAME)
    await setActiveAccount(email)
    return true
  } catch {
    // If migration fails, delete legacy to avoid loops
    await keytar.deletePassword(SERVICE_NAME, LEGACY_ACCOUNT_NAME)
    return false
  }
}

export async function getOAuthClientForActiveAccount(): Promise<{
  client: OAuth2Client | null
  migrated: boolean
}> {
  const migrated = await migrateLegacyToken()
  const active = await getActiveAccount()
  if (!active) return { client: null, migrated }

  const { client_id, client_secret } = await getClientSecrets()
  const client = new OAuth2Client({ clientId: client_id, clientSecret: client_secret })
  const raw = await keytar.getPassword(SERVICE_NAME, active)
  if (!raw) return { client: null, migrated }
  client.setCredentials(JSON.parse(raw) as SavedTokens)
  try {
    await client.getAccessToken()
    return { client, migrated }
  } catch (err) {
    if (err instanceof Error && err.message && err.message.includes('invalid_grant')) {
      await keytar.deletePassword(SERVICE_NAME, active)
      return { client: null, migrated }
    }
    throw err
  }
}

async function loginAndStoreNewAccount(scopes: string[] = SCOPES): Promise<OAuth2Client> {
  const { client_id, client_secret } = await getClientSecrets()
  const client = new OAuth2Client({ clientId: client_id, clientSecret: client_secret })

  const { redirectUri, server, appServer } = await getRedirectUriAndServer()
  const { codeVerifier, codeChallenge } = createPkce()
  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    code_challenge: codeChallenge,
    // @ts-ignore code_challenge_method needs to be S256 but is not defined in types
    code_challenge_method: 'S256',
    redirect_uri: redirectUri,
    prompt: 'consent'
  })
  await shell.openExternal(authUrl)
  const code: string = await waitForCode(server, appServer)
  const { tokens } = await client.getToken({ code, codeVerifier, redirect_uri: redirectUri })
  client.setCredentials(tokens)

  // Determine email for storage
  const oauth2 = google.oauth2({ version: 'v2', auth: client })
  const resp = await oauth2.userinfo.get()
  const email = resp.data.email
  if (!email) throw new Error('Unable to determine account email from OAuth tokens')
  await keytar.setPassword(SERVICE_NAME, email, JSON.stringify(tokens))
  await setActiveAccount(email)
  return client
}

export async function addAccount(): Promise<{ email: string; name: string; picture: string }> {
  const client = await loginAndStoreNewAccount()
  const oauth2 = google.oauth2({ version: 'v2', auth: client })
  const resp = await oauth2.userinfo.get()
  return {
    email: resp.data.email || '',
    name: resp.data.name || 'Unknown User',
    picture: resp.data.picture || ''
  }
}

export async function switchAccount(email: string): Promise<boolean> {
  const raw = await keytar.getPassword(SERVICE_NAME, email)
  if (!raw) return false
  await setActiveAccount(email)
  return true
}

export async function removeAccount(email: string): Promise<void> {
  await keytar.deletePassword(SERVICE_NAME, email)
  const active = await getActiveAccount()
  if (active === email) {
    const remaining = await listAccounts()
    await setActiveAccount(remaining.length ? remaining[0] : null)
  }
}

export async function getUserProfileFor(email?: string): Promise<{
  name: string
  email: string
  picture: string
} | null> {
  try {
    const { client } = email
      ? await getOAuthClientForEmail(email)
      : await getOAuthClientForActiveAccount()
    if (!client) return null
    const oauth2 = google.oauth2({ version: 'v2', auth: client })
    const response = await oauth2.userinfo.get()
    return {
      name: response.data.name || 'Unknown User',
      email: response.data.email || '',
      picture: response.data.picture || ''
    }
  } catch {
    return null
  }
}

async function getOAuthClientForEmail(email: string): Promise<{ client: OAuth2Client | null }> {
  const { client_id, client_secret } = await getClientSecrets()
  const client = new OAuth2Client({ clientId: client_id, clientSecret: client_secret })
  const raw = await keytar.getPassword(SERVICE_NAME, email)
  if (!raw) return { client: null }
  client.setCredentials(JSON.parse(raw) as SavedTokens)
  try {
    await client.getAccessToken()
    return { client }
  } catch {
    return { client: null }
  }
}

export async function listAccountsWithProfiles(): Promise<
  Array<{ email: string; name: string; picture: string }>
> {
  const emails = await listAccounts()
  const results: Array<{ email: string; name: string; picture: string }> = []
  for (const email of emails) {
    const prof = await getUserProfileFor(email)
    if (prof) results.push(prof)
  }
  return results
}
