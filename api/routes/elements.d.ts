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
  type: string
  test: string | string[]
  choices?: Choice
  default?: string | number | boolean | GrammarCard
  only?: boolean
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
