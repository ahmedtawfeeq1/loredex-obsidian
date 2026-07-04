export interface LoredexSettings {
  serverEnabled: boolean
  port: number
  token: string
  /** auto commit+pull+push the vault repo when syncing */
  gitSync: boolean
  /** minutes between open-handoff checks for the status bar badge */
  pollMinutes: number
}

export const DEFAULT_SETTINGS: LoredexSettings = {
  serverEnabled: true,
  port: 28428,
  token: '', // generated on first load
  gitSync: true,
  pollMinutes: 5,
}
