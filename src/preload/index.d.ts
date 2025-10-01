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
      gmail: {
        listAccounts: () => Promise<string[]>
        listAccountsWithProfiles: () => Promise<
          Array<{ email: string; name: string; picture: string }>
        >
        getActiveAccount: () => Promise<string | null>
        switchAccount: (email: string) => Promise<boolean>
        addAccount: () => Promise<{ email: string; name: string; picture: string }>
        removeAccount: (email: string) => Promise<void>
      }
    }
  }
}
