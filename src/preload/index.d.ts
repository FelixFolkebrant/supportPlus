import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      minimize: () => void
      maximize: () => void
      close: () => void
      zoom: {
        get: () => Promise<number>
        set: (factor: number) => Promise<number>
        reset: () => Promise<number>
        in: () => Promise<number>
        out: () => Promise<number>
      }
    }
  }
}
