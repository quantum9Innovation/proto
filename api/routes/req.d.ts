import { type email, type orderedList } from './utils'
import { type GrammarProp, type Card } from './elements'

export interface Config {
  user: {
    name?: string
    email?: email
    start: Date
  }
  languages: {
    ui?: string
    native: string | string[] | orderedList
    target: string | string[]
  }
  config: Record<string, unknown>
}

export interface Session {
  URL: URL
  timestamp: number
  delay: number
}

export interface Document {
  loc: string
  name: string
  content: object
}

export interface LangConfig {
  lang: string
  config: GrammarProp[]
}

export interface NewCard {
  loc: string
  lang: string
  card: Card
  index?: number
}

export interface AddHistory {
  id: string
  timestamp: number
  accuracy: boolean
}
