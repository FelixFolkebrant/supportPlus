# Zoom Functionality Documentation

## Overview

Your Electron app now includes comprehensive zoom functionality to handle high-DPI displays (like 2.4K screens) and provide users with control over the application's zoom level.

## Features

### 🔍 **Automatic DPI Detection**
- The app automatically detects your display resolution and sets an optimal zoom level
- For 2.4K+ displays (2560px+ width): Sets zoom to `scaleFactor * 0.8`
- For 1080p+ displays (1920px+ width): Sets zoom to `scaleFactor * 0.9`
- For smaller displays: Uses the system scale factor

### 🎛️ **Manual Zoom Controls**
- **Zoom In Button**: Increases zoom by 10%
- **Zoom Out Button**: Decreases zoom by 10%  
- **Reset Button**: Shows current zoom percentage, click to reset to optimal zoom
- **Range**: 50% to 300% zoom levels

### ⌨️ **Keyboard Shortcuts**
- `Ctrl/Cmd + +` or `Ctrl/Cmd + =`: Zoom in
- `Ctrl/Cmd + -`: Zoom out
- `Ctrl/Cmd + 0`: Reset to optimal zoom

### 💾 **Persistent Settings**
- Your zoom preference is automatically saved
- The app remembers your zoom level between sessions
- Settings are stored in: `{userData}/settings.json`

## UI Location

The zoom controls are located in the app header, between the user profile and window controls:

```
[User Profile] [Zoom Controls] [Minimize] [Maximize] [Close]
                   [-] [100%] [+]
```

## Technical Implementation

### Components Added:
1. **`useZoom` Hook**: Manages zoom state and operations
2. **`ZoomControls` Component**: UI controls for zoom functionality
3. **`useZoomKeyboardShortcuts` Hook**: Handles keyboard shortcuts
4. **Main Process Handlers**: IPC communication for zoom operations

### Files Modified:
- `src/main/index.ts` - Added zoom IPC handlers and automatic DPI detection
- `src/preload/index.ts` - Exposed zoom APIs to renderer
- `src/renderer/src/components/layout/AppHeader.tsx` - Added zoom controls to UI
- `src/renderer/src/App.tsx` - Added keyboard shortcuts

### Files Added:
- `src/renderer/src/hooks/useZoom.ts`
- `src/renderer/src/hooks/useZoomKeyboardShortcuts.ts`
- `src/renderer/src/components/ui/ZoomControls.tsx`

## Customization

### To adjust the automatic zoom calculation:
Edit the `calculateOptimalZoom()` function in `src/main/index.ts`:

```typescript
function calculateOptimalZoom(): number {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { scaleFactor, workAreaSize } = primaryDisplay
  
  if (workAreaSize.width >= 2560) {
    return Math.max(1.0, scaleFactor * 0.8) // Adjust this multiplier
  }
  // ... rest of the function
}
```

### To change zoom increment:
Edit the zoom handlers in `src/main/index.ts`:

```typescript
ipcMain.handle('zoom:in', () => {
  currentZoomFactor = Math.min(3.0, currentZoomFactor + 0.1) // Change 0.1 to desired increment
  // ...
})
```

### To hide zoom controls:
Remove or comment out the `<ZoomControls />` component in `AppHeader.tsx`.

## Troubleshooting

- **Zoom not working**: Check that IPC handlers are properly registered in main process
- **Keyboard shortcuts not responding**: Ensure `useZoomKeyboardShortcuts()` is called in your main app component
- **Settings not persisting**: Check file permissions in the user data directory
- **UI too small/large**: Try the reset button (`Ctrl/Cmd + 0`) to return to optimal zoom
