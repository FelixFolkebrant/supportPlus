# Knowledge Base Integration - Final Setup Steps

## 1. Main Process Integration

Add the following to your main process entry file (usually `src/main/index.ts`):

```typescript
import { setupDriveHandlers } from './google/drive'

// In your app initialization
setupDriveHandlers()
```

## 2. App Provider Setup

Wrap your App component with the DriveProvider:

```typescript
// In your App.tsx or main renderer entry point
import { DriveProvider } from './hooks/DriveContext'
import { GmailProvider } from './hooks/GmailContext'

export function App() {
  return (
    <GmailProvider>
      <DriveProvider>
        {/* Your existing app content */}
      </DriveProvider>
    </GmailProvider>
  )
}
```

## 3. Chat Integration

Update your existing `useChat` hook to integrate knowledge base context:

```typescript
import { useDrive } from './DriveContext'

// In your useChat hook
const { selectedFiles } = useDrive()

// When sending messages, include knowledge base context:
const sendMessage = async (message: string) => {
  // ... existing code ...

  let knowledgeContext = ''
  if (selectedFiles.length > 0) {
    knowledgeContext = `\n\nKnowledge Base Context:\n${selectedFiles
      .map((file) => `=== ${file.name} ===\n${file.content}`)
      .join('\n\n')}`
  }

  const fullPrompt = message + emailContext + knowledgeContext

  // Send fullPrompt to your AI service
}
```

## 4. Features Implemented

### UI Components

- **Add Documents Button**: Green button next to "New" in chat header
- **Knowledge Base Modal**: Shows connected folder and loaded documents
- **Folder Picker**: Allows users to select from their Google Drive folders
- **Visual Indicator**: Shows number of connected docs in chat header

### Backend Integration

- **Google Drive OAuth**: Extended existing auth to include Drive scope
- **File Content Extraction**: Supports Google Docs, Sheets, PDFs, and text files
- **Folder Management**: List, select, and refresh Drive folders

### Context Integration

- **Knowledge Base Context**: Automatically includes document content in AI prompts
- **Email Context**: Maintains existing email integration
- **Real-time Updates**: Refresh folder contents and file changes

## 5. Usage Flow

1. User clicks "Add Documents" button
2. Folder picker opens showing Google Drive folders
3. User selects a folder containing docs/sheets/PDFs
4. System loads and extracts text content from supported files
5. Chat shows green indicator with document count
6. All chat messages now include knowledge base context
7. User can refresh or disconnect the knowledge base anytime

## 6. Error Handling

- OAuth token refresh for Drive access
- File type validation and extraction errors
- Network connectivity issues
- Empty folder handling

The knowledge base is now fully integrated with your existing Gmail-based chat system!
