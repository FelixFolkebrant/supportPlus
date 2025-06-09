import { OAuth2Client } from 'google-auth-library'
import { google, gmail_v1 } from 'googleapis'
import keytar from 'keytar'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'node:crypto'
import { app, shell } from 'electron'

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

function createPkce() {
  const codeVerifier = crypto.randomBytes(32).toString('base64url')
  const hash = crypto.createHash('sha256').update(codeVerifier).digest()
  const codeChallenge = hash.toString('base64url')
  return { codeVerifier, codeChallenge }
}

export async function getGmailClient(scopes: string[] = SCOPES): Promise<gmail_v1.Gmail> {
  const credsPath = path.join(app.getAppPath(), 'credentials.json')
  const {
    installed: { client_id, client_secret }
  } = JSON.parse(await fs.readFile(credsPath, 'utf-8'))

  const client = new OAuth2Client({ clientId: client_id, clientSecret: client_secret })

  const raw = await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME)
  if (raw) {
    client.setCredentials(JSON.parse(raw) as SavedTokens)
    await client.getAccessToken()
    return google.gmail({ version: 'v1', auth: client })
  }

  const { codeVerifier, codeChallenge } = createPkce()
  const redirectUri = await getRedirectUri()
  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    redirect_uri: redirectUri,
    prompt: 'consent'
  })
  await shell.openExternal(authUrl)
  const code: string = await waitForCode(redirectUri)
  const { tokens } = await client.getToken({ code, codeVerifier, redirect_uri: redirectUri })
  client.setCredentials(tokens)
  await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, JSON.stringify(tokens))
  return google.gmail({ version: 'v1', auth: client })
}

// Helper for PKCE redirect
import express from 'express'
import { createServer } from 'http'
async function getRedirectUri(): Promise<string> {
  const appServer = express()
  const server = createServer(appServer)
  await new Promise<void>((ok) => server.listen(0, ok))
  const { port } = server.address() as any
  return `http://127.0.0.1:${port}`
}
async function waitForCode(redirectUri: string): Promise<string> {
  const port = Number(redirectUri.split(':').pop())
  const appServer = express()
  const server = createServer(appServer)
  await new Promise<void>((ok) => server.listen(port, ok))
  return await new Promise((resolve) => {
    appServer.get('/', (req, res) => {
      res.send('<h3>You may now close this window.</h3>')
      resolve(req.query.code as string)
      setImmediate(() => server.close())
    })
  })
}
