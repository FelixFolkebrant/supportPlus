import { createServer } from 'http'
import express from 'express'
import { OAuth2Client } from 'google-auth-library'
import { google, gmail_v1 } from 'googleapis'
import keytar from 'keytar'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'node:crypto'
import { app, ipcMain, shell } from 'electron';

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']
const SERVICE_NAME = 'MyElectronMail'
const ACCOUNT_NAME = 'tokens'

interface SavedTokens {
  access_token: string
  refresh_token: string
  scope: string
  expiry_date: number
  token_type: string
}

/* ---------- PKCE helper that works with every library version --------- */
function createPkce() {
  // RFC 7636 §4.1 – 43-128 bytes; Google is fine with 32 bytes
  const codeVerifier = crypto.randomBytes(32).toString('base64url')
  const hash = crypto.createHash('sha256').update(codeVerifier).digest()
  const codeChallenge = hash.toString('base64url')
  return { codeVerifier, codeChallenge }
}
/* ---------------------------------------------------------------------- */

export async function getGmailClient(): Promise<gmail_v1.Gmail> {
  /* 1️⃣  read your desktop-app credentials.json */
  const credsPath = path.join(app.getAppPath(), 'credentials.json')
  const {
    installed: { client_id, client_secret }
  } = JSON.parse(await fs.readFile(credsPath, 'utf-8'))

  const client = new OAuth2Client({ clientId: client_id, clientSecret: client_secret })

  /* 2️⃣  try a saved refresh-token first */
  const raw = await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME)
  if (raw) {
    client.setCredentials(JSON.parse(raw) as SavedTokens)
    await client.getAccessToken() // refreshes if expired
    return google.gmail({ version: 'v1', auth: client })
  }

  /* 3️⃣  new login – create PKCE strings & loopback server */
  const { codeVerifier, codeChallenge } = createPkce()

  const appServer = express()
  const server = createServer(appServer)
  await new Promise<void>((ok) => server.listen(0, ok))
  const { port } = server.address() as any
  const redirectUri = `http://127.0.0.1:${port}`

  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    redirect_uri: redirectUri,
    prompt: 'consent'
  })
  await shell.openExternal(authUrl)

  /* 3d — wait for Google to bounce back with ?code= */
  const code: string = await new Promise((resolve) => {
    appServer.get('/', (req, res) => {
      res.send('<h3>You may now close this window.</h3>')
      resolve(req.query.code as string)
      setImmediate(() => server.close())
    })
  })

  /* 3e — exchange, save refresh token */
  const { tokens } = await client.getToken({ code, codeVerifier, redirect_uri: redirectUri })
  client.setCredentials(tokens)
  await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, JSON.stringify(tokens))

  return google.gmail({ version: 'v1', auth: client })
}

/* IPC —— renderer does ipcRenderer.invoke('gmail:getLast3') */
ipcMain.handle('gmail:getLast3', async () => {
  const gmail = await getGmailClient()
  const { data } = await gmail.users.messages.list({
    userId: 'me',
    maxResults: 3,
    labelIds: ['INBOX'],
    q: 'category:primary'
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
    id: d.data.id,
    subject: header(d.data, 'Subject'),
    from: header(d.data, 'From'),
    snippet: d.data.snippet
  }))
})

function header(msg: gmail_v1.Schema$Message, name: string) {
  return msg.payload?.headers?.find((h) => h.name === name)?.value ?? ''
}
