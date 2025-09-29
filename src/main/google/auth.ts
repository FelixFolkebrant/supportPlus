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
const ACCOUNT_NAME = 'tokens'

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
  const credsPath = isPackaged
    ? path.join(process.resourcesPath, 'credentials.json')
    : path.join(app.getAppPath(), 'credentials.json')

  const {
    installed: { client_id, client_secret }
  } = JSON.parse(await fs.readFile(credsPath, 'utf-8'))

  const client = new OAuth2Client({ clientId: client_id, clientSecret: client_secret })

  const raw = await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME)
  if (raw) {
    client.setCredentials(JSON.parse(raw) as SavedTokens)
    try {
      await client.getAccessToken()
      return google.gmail({ version: 'v1', auth: client })
    } catch (err) {
      if (err instanceof Error && err.message && err.message.includes('invalid_grant')) {
        // Token is invalid, clear and continue to login flow
        await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME)
      } else {
        throw err
      }
    }
  }

  const { redirectUri, server, appServer } = await getRedirectUriAndServer()
  const { codeVerifier, codeChallenge } = createPkce()
  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    code_challenge: codeChallenge,
    // @ts-ignore code_challenge_method needs to be S256 but is not defined in types
    code_challenge_method: 'S256', // Needs to be S256
    redirect_uri: redirectUri,
    prompt: 'consent'
  })
  await shell.openExternal(authUrl)
  const code: string = await waitForCode(server, appServer)
  const { tokens } = await client.getToken({ code, codeVerifier, redirect_uri: redirectUri })
  client.setCredentials(tokens)
  await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, JSON.stringify(tokens))
  return google.gmail({ version: 'v1', auth: client })
}

export async function getDriveClient(scopes: string[] = SCOPES): Promise<drive_v3.Drive> {
  const credsPath = isPackaged
    ? path.join(process.resourcesPath, 'credentials.json')
    : path.join(app.getAppPath(), 'credentials.json')

  const {
    installed: { client_id, client_secret }
  } = JSON.parse(await fs.readFile(credsPath, 'utf-8'))

  const client = new OAuth2Client({ clientId: client_id, clientSecret: client_secret })

  const raw = await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME)
  if (raw) {
    client.setCredentials(JSON.parse(raw) as SavedTokens)
    try {
      await client.getAccessToken()
      return google.drive({ version: 'v3', auth: client })
    } catch (err) {
      if (err instanceof Error && err.message && err.message.includes('invalid_grant')) {
        // Token is invalid, clear and continue to login flow
        await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME)
      } else {
        throw err
      }
    }
  }

  // If no token or invalid token, use the same login flow as Gmail
  const { redirectUri, server, appServer } = await getRedirectUriAndServer()
  const { codeVerifier, codeChallenge } = createPkce()
  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    code_challenge: codeChallenge,
    // @ts-ignore code_challenge_method needs to be S256 but is not defined in types
    code_challenge_method: 'S256', // Needs to be S256
    redirect_uri: redirectUri,
    prompt: 'consent'
  })
  await shell.openExternal(authUrl)
  const code: string = await waitForCode(server, appServer)
  const { tokens } = await client.getToken({ code, codeVerifier, redirect_uri: redirectUri })
  client.setCredentials(tokens)
  await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, JSON.stringify(tokens))
  return google.drive({ version: 'v3', auth: client })
}

export async function hasValidToken(): Promise<boolean> {
  try {
    const raw = await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME)
    if (!raw) return false

    const tokens = JSON.parse(raw) as SavedTokens

    // Create a temporary client to test the token
    const credsPath = isPackaged
      ? path.join(process.resourcesPath, 'credentials.json')
      : path.join(app.getAppPath(), 'credentials.json')

    const {
      installed: { client_id, client_secret }
    } = JSON.parse(await fs.readFile(credsPath, 'utf-8'))

    const client = new OAuth2Client({ clientId: client_id, clientSecret: client_secret })
    client.setCredentials(tokens)

    // Actually test the token by making a simple API call
    try {
      await client.getAccessToken()
      // Make a simple API call to verify the token works
      const gmail = google.gmail({ version: 'v1', auth: client })
      await gmail.users.getProfile({ userId: 'me' })
      return true
    } catch {
      // Token is invalid, clean it up
      await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME)
      return false
    }
  } catch {
    return false
  }
}

export async function logout(): Promise<void> {
  await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME)
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
