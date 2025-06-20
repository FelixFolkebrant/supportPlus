import { OAuth2Client } from 'google-auth-library'
import { google, gmail_v1 } from 'googleapis'
import keytar from 'keytar'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'node:crypto'
import { app, shell } from 'electron'

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
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
  const credsPath = path.join(app.getAppPath(), 'credentials.json')
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

export async function hasValidToken(): Promise<boolean> {
  const raw = await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME)
  if (!raw) return false
  const tokens = JSON.parse(raw) as SavedTokens
  // Check expiry (Google tokens are in ms)
  if (!tokens.expiry_date || tokens.expiry_date < Date.now()) return false
  return true
}

export async function logout(): Promise<void> {
  await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME)
}
