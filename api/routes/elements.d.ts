import { type Choice, type Test } from './utils'

export interface History {
  tests: Test[]
  score: number
}

export interface GrammarCard {
  term: string
  definition: string
}

export interface GrammarProp {
  name: string
  type: 'string' | 'number' | 'boolean' | 'Choice' | 'GrammarCard'
  test: boolean
  method?: 'prefix' | 'suffix' | 'inline' | 'form' | 'separately'
  hint?: boolean
  separator?: string
  choices?: Choice
  default?: string | string[] | number | boolean | GrammarCard
  only?: number
}

export interface Grammar {
  pos?: string
  context?: string
  properties?: Record<string, any>
}

export interface Phrase {
  term: string
  definition: string
  grammar?: Grammar
  tags?: string[]
  notes?: string
  history?: History
}

export interface Card {
  term: string
  definition: string
  grammar?: Grammar
  phrases?: Phrase[]
  tags?: string[]
  notes?: string
  history?: History
  id?: string
}
