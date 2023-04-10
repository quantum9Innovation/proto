// Cards

// Type Definitions
import { type AddHistory, type LangConfig, type NewCard } from './req'
import { type GrammarProp, type Card } from './elements'

// Imports
import { root } from '../index'
import { score } from './calc/repetition'
import * as fs from 'fs'
import * as path from 'path'
import * as express from 'express'

// Create router
const card = express.Router()

// Define config methods
// Retrieve language config
card.get('/', (req, res) => {
  const language = req.query.lang as string
  const config = path.join(root, language, 'grammar.json')
  if (!fs.existsSync(config)) {
    return res.status(404).send('Requested language config does not exist.')
  }
  const raw = fs.readFileSync(config, 'utf8')
  const data: GrammarProp[] = JSON.parse(raw).config
  res.json(data)
})

// Upload initial language config
card.post('/', (req, res) => {
  const reqConfig: LangConfig = req.body
  const { lang, config } = reqConfig
  const langDir = path.join(root, lang)

  // Check for language directory
  if (!fs.existsSync(langDir)) fs.mkdirSync(langDir)

  // Check all grammar properties
  for (const prop of config) {
    /* istanbul ignore next */
    if (prop.name.includes('history')) return res.status(400).send('Invalid grammar property name.')
    /* istanbul ignore next */
    if (prop.type === 'Choice' && prop.choices === undefined) {
      return res.status(400).send(`No choices specified for grammar property ${prop.name}.`)
    }
  }

  // Write to config
  fs.writeFileSync(
    path.join(langDir, 'grammar.json'),
    JSON.stringify({ config })
  )

  res.json({
    message: `"${lang}" config successful.`
  })
})

// Define basic card methods
// Get specific card given a location
card.get('/fetch', (req, res) => {
  // Parse query
  let uri = '/'
  let index = 0

  if (req.query.id === undefined) {
    uri = req.query.path as string
    index = parseInt(req.query.index as string)
  } else if (typeof req.query.id === 'string') {
    const id = req.query.id.split(':')
    uri = id[0]
    index = parseInt(id[1])
  }

  const name = path.join(root, uri)

  // Check resource
  /* istanbul ignore next */
  if (!fs.existsSync(name)) return res.status(404).send('Resource not found.')
  /* istanbul ignore next */
  if (!fs.statSync(name).isFile()) return res.status(400).send('Resource is not a document.')

  // Find card
  const raw = fs.readFileSync(name, 'utf8')
  const data: Card[] = JSON.parse(raw).cards
  if (index >= data.length) return res.status(404).send('Card not found.')
  const card = data[index]

  res.json(card)
})

// Add a new card to an existing document
card.post('/add', (req, res) => {
  const reqAdd: NewCard = req.body
  let { loc, lang, card, index } = reqAdd
  const relPath = loc
  loc = path.join(root, loc)

  // Check if modifying protected trash directory
  /* istanbul ignore next */
  if (loc.includes('purged')) return res.status(403).send('Modifying trash directory disallowed.')
  // Check if location doesn't exist
  /* istanbul ignore next */
  if (!fs.existsSync(loc)) return res.status(404).send('Location does not exist.')
  // Check if location is a directory
  /* istanbul ignore next */
  if (!fs.statSync(loc).isFile()) return res.status(400).send('Resource is not a document.')

  // Read from file
  const raw = JSON.parse(fs.readFileSync(loc, 'utf8'))
  if (raw.cards === undefined) raw.cards = []
  const cards: Card[] = raw.cards

  // Check if index is defined
  if (index === undefined) index = cards.length
  else if (index < 0) index += cards.length

  // Check card grammatical properties
  const grammar: GrammarProp[] = JSON.parse(
    fs.readFileSync(path.join(root, lang, 'grammar.json'), 'utf8')
  ).config
  if (card.grammar?.properties !== undefined) {
    for (const [prop, value] of Object.entries(card.grammar.properties)) {
      let match = false
      let defaultType

      for (const defProp of grammar) {
        if (defProp.name === prop) {
          match = true
          defaultType = defProp.default
        }
      }

      if (!match) return res.status(400).send(`Grammar property ${prop} is not defined.`)
      if (defaultType === true && value === null) {
        card.grammar.properties[prop] = defaultType
      }
    }
  }

  // Write to file
  card.id = relPath + ':' + index.toString()
  cards.splice(index, 0, card)
  fs.writeFileSync(loc, JSON.stringify({ cards }))

  res.json({
    message: 'Card uploaded successfully.'
  })
})

// Delete a card from an existing document
card.delete('/remove', (req, res) => {
  const loc = req.query.loc as string
  const name = path.join(root, loc)
  let index = parseInt(req.query.index as string)

  // Check if location exists
  if (!fs.existsSync(name)) {
    return res.status(404).send('Location does not exist; card not found.')
  }
  // Check if location is a directory
  /* istanbul ignore next */
  if (!fs.statSync(name).isFile()) return res.status(400).send('Resource is not a document.')

  // Read from file
  const raw = JSON.parse(fs.readFileSync(name, 'utf8'))
  /* istanbul ignore next */
  if (raw.cards === undefined) res.status(404).send('Document contains no cards; card not found.')
  const cards: Card[] = raw.cards

  // Adjust index
  /* istanbul ignore next */
  if (index < 0) index += cards.length

  // Write to file
  cards.splice(index, 1)
  fs.writeFileSync(name, JSON.stringify({ cards }))

  res.json({
    message: 'Card moved to trash.'
  })
})

// Define advanced card methods
// Get all items for testing in directory and rank by history criteria
card.get('/list', (req, res) => {
  const loc = req.query.path as string
  const pathname = path.join(root, loc)
  const lang = req.query.lang as string

  const cards: Card[] = []
  const tests: Card[] = []

  // Check resource
  /* istanbul ignore next */
  if (!fs.existsSync(pathname)) return res.status(404).send('Resource not found.')
  const isFile = fs.statSync(pathname).isFile()
  const isDirectory = fs.statSync(pathname).isDirectory()
  /* istanbul ignore next */
  if (!isFile && !isDirectory) return res.status(500).send('Resource type could not be determined.')

  // Get all cards
  if (isFile) {
    const raw = JSON.parse(fs.readFileSync(pathname, 'utf8'))
    /* istanbul ignore next */
    if (raw.cards === undefined) return res.status(404).send('Document contains no cards.')
    cards.push(...raw.cards)
  } else {
    // Recursively get all documents in directory
    const files: string[] = []
    const traverse = (dir: string) => {
      fs.readdirSync(dir).forEach(file => {
        const abs = path.join(dir, file)
        /* istanbul ignore next */
        if (fs.statSync(abs).isDirectory()) { traverse(abs) } else if (fs.statSync(abs).isFile()) return files.push(abs)
      })
    }
    traverse(pathname)

    // Recursively get all cards in each document
    files.forEach(file => {
      const raw = JSON.parse(fs.readFileSync(file, 'utf8'))
      if (raw.cards === undefined) return
      cards.push(...raw.cards)
    })
  }

  // Check card grammatical properties
  const grammar: GrammarProp[] = JSON.parse(
    fs.readFileSync(path.join(root, lang, 'grammar.json'), 'utf8')
  ).config
  const testedProps: string[] = []

  for (const defProp of grammar) {
    // Get test property with correct type
    let test: string[]
    typeof defProp.test === 'string' ? test = [defProp.test] : test = defProp.test

    // Check if test requirements are met
    if (test.includes('separately')) testedProps.push(defProp.name)
  }

  // Expand cards into tests (find all subcards)
  cards.forEach(card => {
    // Card
    if (card.history === undefined) {
      card.history = {
        tests: [],
        score: 0
      }
    }
    tests.push(card)

    // Phrase
    if (card.phrases !== undefined) {
      for (const [index, phrase] of card.phrases.entries()) {
        // Make into card
        const phraseCard: Card = phrase
        phraseCard.id = (card.id as string) + ':PHRASE:' + index.toString()
        if (phraseCard.history === undefined) {
          phraseCard.history = {
            tests: [],
            score: 0
          }
        }
        tests.push(phraseCard)

        // Find tested grammar properties
        /* istanbul ignore next */
        if (phrase.grammar?.properties !== undefined) {
          const props = phrase.grammar.properties
          for (const propKey of Object.keys(props)) {
            if (testedProps.includes(propKey) && typeof propKey === 'string') {
              if (props[propKey + '-history'] === undefined) {
                props[propKey + '-history'] = {
                  tests: [],
                  score: 0
                }
              }
              tests.push({
                term: `${phrase.term} (${propKey})`,
                definition: props[propKey],
                history: props[propKey + '-history'],
                id: phraseCard.id + ':GRAMMAR:' + propKey
              })
            }
          }
        }
      }
    }

    // Grammar
    /* istanbul ignore next */
    if (card.grammar?.properties !== undefined) {
      const props = card.grammar.properties
      for (const propKey of Object.keys(props)) {
        if (testedProps.includes(propKey) && typeof propKey === 'string') {
          if (props[propKey + '-history'] === undefined) {
            props[propKey + '-history'] = {
              tests: [],
              score: 0
            }
          }
          tests.push({
            term: `${card.term} (${propKey})`,
            definition: props[propKey],
            history: props[propKey + '-history'],
            id: (card.id as string) + ':GRAMMAR:' + propKey
          })
        }
      }
    }
  })

  // Sort tests by score and return
  tests.sort((a, b) => {
    /* istanbul ignore next */
    if (a.history?.score === undefined) return -1
    /* istanbul ignore next */
    if (b.history?.score === undefined) return 1
    return a.history.score - b.history.score
  })
  res.json(tests)
})

// Append or update history to object given ID
card.post('/history', (req, res) => {
  // Parse request
  const { id: rawID, timestamp, accuracy }: AddHistory = req.body
  const id = rawID.split(':')
  const uri = id[0]
  const index = parseInt(id[1])
  const name = path.join(root, uri)

  // Identify ID object type
  let type = 'base'
  if (id.length >= 3) {
    if (id[2] === 'GRAMMAR') type = 'grammar'
    else if (id[2] === 'PHRASE') type = 'phrase'
  } if (id.length >= 5) {
    if (id[2] === 'PHRASE' && id[4] === 'GRAMMAR') type = 'phrase-grammar'
  }

  // Check resource
  /* istanbul ignore next */
  if (!fs.existsSync(name)) return res.status(404).send('Resource not found.')
  /* istanbul ignore next */
  if (!fs.statSync(name).isFile()) return res.status(400).send('Resource is not a document.')

  // Find card
  const raw = fs.readFileSync(name, 'utf8')
  const data: Card[] = JSON.parse(raw).cards
  const card = data[index]

  // Update history according to type
  /*
    PATH:INDEX ?
    | + :"GRAMMAR":PROPERTY
    | + :"PHRASE":INDEX
    | + :"PHRASE":INDEX:"GRAMMAR":PROPERTY
  */
  /* istanbul ignore else */
  if (type === 'base') {
    // Base case
    if (card.history === undefined) card.history = { tests: [], score: 0 }
    card.history.tests.push([timestamp, accuracy])
    score(card.history)
  } else if (type === 'grammar' && card.grammar?.properties !== undefined) {
    // Grammar case
    const properties = card.grammar.properties
    if (properties[id[3] + '-history'] === undefined) {
      properties[id[3] + '-history'] = { tests: [], score: 0 }
    }
    properties[id[3] + '-history'].tests.push([timestamp, accuracy])
    score(properties[id[3] + '-history'])
  } else if (type === 'phrase' && card.phrases !== undefined) {
    // Phrase case
    const phrase = card.phrases[parseInt(id[3])]
    if (phrase.history === undefined) phrase.history = { tests: [], score: 0 }
    phrase.history.tests.push([timestamp, accuracy])
    score(phrase.history)
  } else if (type === 'phrase-grammar' && card.phrases !== undefined) {
    // Phrase-Grammar case
    const phrase = card.phrases[parseInt(id[3])]
    /* istanbul ignore next */
    if (phrase.grammar?.properties === undefined) {
      return res.status(404).send('Phrase has no grammar properties.')
    }
    const properties = phrase.grammar.properties
    if (properties[id[5] + '-history'] === undefined) {
      properties[id[5] + '-history'] = { tests: [], score: 0 }
    }
    properties[id[5] + '-history'].tests.push([timestamp, accuracy])
    score(properties[id[5] + '-history'])
  }

  // Write new data
  fs.writeFileSync(name, JSON.stringify({ cards: data }))
  res.send({
    message: 'Successfully updated history.'
  })
})

// Recalculate scores for a given path
/* istanbul ignore next */
const rescore = (loc: string, lang: string) => {
  const pathname = path.join(root, loc)
  const cards: Card[] = []

  // Recursively get all documents in directory
  const files: string[] = []
  const traverse = (dir: string) => {
    fs.readdirSync(dir).forEach(file => {
      const abs = path.join(dir, file)
      if (fs.statSync(abs).isDirectory()) { traverse(abs) } else if (fs.statSync(abs).isFile()) return files.push(abs)
    })
  }
  traverse(pathname)

  // Recursively get all cards in each document
  files.forEach(file => {
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'))
    if (raw.cards === undefined) return
    cards.push(...raw.cards)
  })

  // Check card grammatical properties
  const grammar: GrammarProp[] = JSON.parse(
    fs.readFileSync(path.join(root, lang, 'grammar.json'), 'utf8')
  ).config
  const testedProps: string[] = []

  for (const defProp of grammar) {
    // Get test property with correct type
    let test: string[]
    typeof defProp.test === 'string' ? test = [defProp.test] : test = defProp.test

    // Check if test requirements are met
    if (test.includes('separately')) testedProps.push(defProp.name)
  }

  // Expand cards into tests (find all subcards)
  cards.forEach(card => {
    // Card
    if (card.history === undefined) {
      card.history = {
        tests: [],
        score: 0
      }
    }
    score(card.history)

    // Phrase
    if (card.phrases !== undefined) {
      for (const [, phrase] of card.phrases.entries()) {
        if (phrase.history === undefined) {
          phrase.history = {
            tests: [],
            score: 0
          }
        }
        score(phrase.history)

        // Find tested grammar properties
        if (phrase.grammar?.properties !== undefined) {
          const props = phrase.grammar.properties
          for (const propKey of Object.keys(props)) {
            if (testedProps.includes(propKey) && typeof propKey === 'string') {
              if (props[propKey + '-history'] === undefined) {
                props[propKey + '-history'] = {
                  tests: [],
                  score: 0
                }
              }
              score(props[propKey + '-history'])
            }
          }
        }
      }
    }

    // Grammar
    if (card.grammar?.properties !== undefined) {
      const props = card.grammar.properties
      for (const propKey of Object.keys(props)) {
        if (testedProps.includes(propKey) && typeof propKey === 'string') {
          if (props[propKey + '-history'] === undefined) {
            props[propKey + '-history'] = {
              tests: [],
              score: 0
            }
          }
          score(props[propKey + '-history'])
        }
      }
    }
  })
}

// Exports
export { card, rescore }
