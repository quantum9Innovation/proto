// Test all endpoints in card/

// Type definitions
import { type StdRes, type JSONRes } from './res'

// Imports
import { endpoint } from './setup'
import { app } from '../index'
import { expect } from '@jest/globals'

// Tests
// Language config
describe('/card (base)', () => {
  const engConfig = [
    {
      name: 'transitive',
      type: 'boolean',
      test: true,
      method: 'separately'
    },
    {
      name: 'reflexive',
      type: 'boolean',
      test: false,
      default: true
    }
  ]

  // Get nonexistent language config
  describe('GET /card (nonexistence)', () => {
    test('*', endpoint(app, '/card', (res: JSONRes) => {
      expect(res.text).toBe('Requested language config does not exist.')
    }, {
      status: 404,
      contentType: 'text/html; charset=utf-8',
      request: { lang: 'lang-eng' }
    }))
  })

  // Post language config
  describe('POST /card', () => {
    test('*', endpoint(app, '/card', (res: StdRes) => {
      expect(res.body.message).toBe('"lang-eng" config successful.')
    }, {
      method: 'post',
      request: {
        lang: 'lang-eng',
        config: engConfig
      }
    }))
  })

  // Get published language config
  describe('GET /card (published)', () => {
    test('*', endpoint(app, '/card', (res: JSONRes) => {
      const config = JSON.parse(res.text)
      expect(config).toStrictEqual(engConfig)
    }, {
      request: { lang: 'lang-eng' }
    }))
  })
})

// Basic card methods
describe('Basic card methods', () => {
  const testCard: any = {
    term: 'test',
    definition: 'test definition',
    grammar: {
      pos: 'verb',
      context: '(the functioning or validity of)',
      properties: {
        transitive: true
      }
    },
    phrases: [{
      term: 'test out',
      definition: 'test definition',
      grammar: {
        pos: 'verb',
        context: '(of a course)',
        properties: {
          transitive: false
        }
      }
    }]
  }
  const deletedCard: any = {
    term: 'delete',
    definition: 'this will be deleted',
    grammar: {
      pos: 'verb',
      context: '(remove from existence)',
      properties: { reflexive: null }
    }
  }

  // Create document
  describe('Create document', () => {
    test('*', endpoint(app, '/vfs/document', (res: StdRes) => {
      expect(res.body.message).toBe('Document uploaded successfully.')
    }, {
      method: 'post',
      request: {
        loc: '/lang-eng/',
        name: 'main',
        content: {}
      }
    }))
  })

  // Add card
  describe('POST /card/add', () => {
    test('first', endpoint(app, '/card/add', (res: StdRes) => {
      expect(res.body.message).toBe('Card uploaded successfully.')
    }, {
      method: 'post',
      request: {
        loc: '/lang-eng/main.json',
        lang: 'lang-eng',
        card: testCard
      }
    }))

    test('second (to be deleted)', endpoint(app, '/card/add', (res: StdRes) => {
      expect(res.body.message).toBe('Card uploaded successfully.')
    }, {
      method: 'post',
      request: {
        loc: '/lang-eng/main.json',
        lang: 'lang-eng',
        card: deletedCard,
        index: -2
      }
    }))
  })

  // Get card
  describe('GET /card/fetch', () => {
    test('existence (std)', endpoint(app, '/card/fetch', (res: JSONRes) => {
      const card = JSON.parse(res.text)
      testCard.id = '/lang-eng/main.json:0'
      expect(card).toStrictEqual(testCard)
    }, {
      request: {
        path: '/lang-eng/main.json',
        index: 1
      }
    }))

    test('existence (id)', endpoint(app, '/card/fetch', (res: JSONRes) => {
      const card = JSON.parse(res.text)
      testCard.id = '/lang-eng/main.json:0'
      expect(card).toStrictEqual(testCard)
    }, {
      request: { id: '/lang-eng/main.json:1' }
    }))
  })

  // Delete card
  describe('DELETE /card/remove', () => {
    test('existing', endpoint(app, '/card/remove', (res: StdRes) => {
      expect(res.body.message).toBe('Card moved to trash.')
    }, {
      method: 'delete',
      request: {
        loc: '/lang-eng/main.json',
        index: 0
      }
    }))

    test('not found', endpoint(app, '/card/remove', (res: JSONRes) => {
      expect(res.text).toBe('Location does not exist; card not found.')
    }, {
      method: 'delete',
      status: 404,
      contentType: 'text/html; charset=utf-8',
      request: {
        loc: '/lang-eng/error.json',
        index: 0
      }
    }))
  })

  // Check if card still exists
  describe('GET /card/fetch', () => {
    test('nonexistence', endpoint(app, '/card/fetch', (res: JSONRes) => {
      expect(res.text).toEqual('Card not found.')
    }, {
      contentType: 'text/html; charset=utf-8',
      status: 404,
      request: {
        path: '/lang-eng/main.json',
        index: 1
      }
    }))
  })
})

// Advanced card methods
describe('Advanced card methods', () => {
  let cards: any[] = []

  // List cards
  describe('GET /card/list', () => {
    test('initial (file)', endpoint(app, '/card/list', (res: JSONRes) => {
      cards = JSON.parse(res.text)
      expect(cards).toHaveLength(4)
    }, {
      request: {
        path: '/lang-eng/main.json',
        lang: 'lang-eng'
      }
    }))

    test('initial (root)', endpoint(app, '/card/list', (res: JSONRes) => {
      cards = JSON.parse(res.text)
      expect(cards).toHaveLength(4)
    }, {
      request: {
        path: '/lang-eng/',
        lang: 'lang-eng'
      }
    }))
  })

  // Upload new histories
  const now = (new Date()).getTime()
  const DAY = 1000 * 60 * 60 * 24
  describe('POST /card/history (std)', () => {
    test('correct (first)', endpoint(app, '/card/history', (res: StdRes) => {
      expect(res.body.message).toBe('Successfully updated history.')
    }, {
      method: 'post',
      request: {
        id: '/lang-eng/main.json:0',
        timestamp: now - DAY,
        accuracy: true
      }
    }))

    test('correct (second)', endpoint(app, '/card/history', (res: StdRes) => {
      expect(res.body.message).toBe('Successfully updated history.')
    }, {
      method: 'post',
      request: {
        id: '/lang-eng/main.json:0',
        timestamp: now,
        accuracy: true
      }
    }))

    test('incorrect', endpoint(app, '/card/history', (res: StdRes) => {
      expect(res.body.message).toBe('Successfully updated history.')
    }, {
      method: 'post',
      request: {
        id: '/lang-eng/main.json:0:PHRASE:0',
        timestamp: now - DAY / 24,
        accuracy: false
      }
    }))

    test('grammar', endpoint(app, '/card/history', (res: StdRes) => {
      expect(res.body.message).toBe('Successfully updated history.')
    }, {
      method: 'post',
      request: {
        id: '/lang-eng/main.json:0:GRAMMAR:0',
        timestamp: now - DAY / 24,
        accuracy: true
      }
    }))

    test('phrase-grammar', endpoint(app, '/card/history', (res: StdRes) => {
      expect(res.body.message).toBe('Successfully updated history.')
    }, {
      method: 'post',
      request: {
        id: '/lang-eng/main.json:0:PHRASE:0:GRAMMAR:0',
        timestamp: now - 2 * DAY / 24,
        accuracy: true
      }
    }))
  })

  // Relist cards
  describe('GET /card/list', () => {
    test('ordered', endpoint(app, '/card/list', (res: JSONRes) => {
      const received = JSON.parse(res.text)
      const IDs = received.map((c: any) => c.id)
      expect(received).toHaveLength(4)
      const i1 = IDs.indexOf('/lang-eng/main.json:0')
      const i2 = IDs.indexOf('/lang-eng/main.json:0:PHRASE:0')
      expect(i2 < i1).toBe(true)
    }, {
      request: {
        path: '/lang-eng/main.json',
        lang: 'lang-eng'
      }
    }))
  })

  // Add new first card without phrase grammar properties
  describe('POST /card/add', () => {
    const testCard: any = {
      term: 'test',
      definition: 'test definition',
      grammar: {
        pos: 'verb',
        context: '(the functioning or validity of)'
      },
      phrases: [{
        term: 'test out',
        definition: 'test definition',
        grammar: {
          pos: 'verb',
          context: '(of a course)'
        }
      }]
    }
    const noGrammarCard: any = {
      term: 'grammar',
      definition: 'definition',
      phrases: [{
        term: 'phrase',
        definition: 'definition'
      }]
    }
    const errCard: any = {
      term: 'test',
      definition: 'test definition',
      grammar: {
        pos: 'verb',
        context: '(the functioning or validity of)',
        properties: {
          random: true
        }
      }
    }

    test('without phrase grammar', endpoint(app, '/card/add', (res: StdRes) => {
      expect(res.body.message).toBe('Card uploaded successfully.')
    }, {
      method: 'post',
      request: {
        loc: '/lang-eng/main.json',
        lang: 'lang-eng',
        card: testCard,
        index: 0
      }
    }))

    test('without any grammar', endpoint(app, '/card/add', (res: StdRes) => {
      expect(res.body.message).toBe('Card uploaded successfully.')
    }, {
      method: 'post',
      request: {
        loc: '/lang-eng/main.json',
        lang: 'lang-eng',
        card: noGrammarCard,
        index: 1
      }
    }))

    test('with erroneous grammar', endpoint(app, '/card/add', (res: JSONRes) => {
      expect(res.text).toBe('Grammar property random is not defined.')
    }, {
      method: 'post',
      status: 400,
      contentType: 'text/html; charset=utf-8',
      request: {
        loc: '/lang-eng/main.json',
        lang: 'lang-eng',
        card: errCard,
        index: 0
      }
    }))
  })

  // Probe error case where phrase grammar properties are missing
  describe('POST /card/history (err)', () => {
    test('phrase-grammar', endpoint(app, '/card/history', (res: JSONRes) => {
      expect(res.text).toBe('Phrase has no grammar properties.')
    }, {
      method: 'post',
      status: 404,
      contentType: 'text/html; charset=utf-8',
      request: {
        id: '/lang-eng/main.json:0:PHRASE:0:GRAMMAR:0',
        timestamp: now - 2 * DAY / 24,
        accuracy: true
      }
    }))
  })
})

export {}
