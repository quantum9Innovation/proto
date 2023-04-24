export interface Config {
  host: string
  port: number
  root: string
  https?: {
    key: string
    cert: string
  }
  settings?: {
    limit?: number
  }
}
