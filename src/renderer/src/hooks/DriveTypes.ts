export interface DriveFile {
  id: string
  name: string
  mimeType: string
  webViewLink?: string
  modifiedTime?: string
  content?: string
}

export interface DriveFolder {
  id: string
  name: string
  files: DriveFile[]
}

export interface DriveContextValue {
  knowledgeBaseFolder: DriveFolder | null
  selectedFiles: DriveFile[]
  loading: boolean
  error: string | null
  selectKnowledgeBaseFolder: (folderId?: string) => Promise<void>
  clearKnowledgeBase: () => void
  refreshFiles: () => Promise<void>
}

export const KNOWLEDGE_BASE_STORAGE_KEY = 'knowledgeBaseFolder'
