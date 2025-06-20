import { google } from 'googleapis'
import { getGmailClient } from './auth'

export interface UserProfile {
  name: string
  email: string
  picture: string
}

export async function getUserProfile(): Promise<UserProfile> {
  const gmailClient = await getGmailClient()

  // Get the OAuth2 client from the Gmail client
  const auth = gmailClient.context._options.auth

  // Use the OAuth2 client to make a request to the Google+ API (now People API)
  const oauth2 = google.oauth2({ version: 'v2', auth })

  const response = await oauth2.userinfo.get()

  return {
    name: response.data.name || 'Unknown User',
    email: response.data.email || '',
    picture: response.data.picture || ''
  }
}
