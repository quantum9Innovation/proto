export interface Config {
  host: string
  port: number
  root: string
  https?: {
    key: string
    cert: string
    pin?: string
  }
  settings?: {
    limit?: number
  }
}
