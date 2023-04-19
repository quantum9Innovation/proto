export interface Config {
  host: string
  port: number
  root: string
  settings?: {
    limit?: number
  }
}
