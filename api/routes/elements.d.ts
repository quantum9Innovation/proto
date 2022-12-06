import { Choice, Test } from './utils'

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
  default?: string | number | boolean | Choice | GrammarCard
  only?: boolean
}

export interface Grammar {
  pos?: string
  context?: string
  properties?: { [key: string]: any }
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
