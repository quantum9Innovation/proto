// Test all endpoints in init/

// Type definitions
import { type StdRes, type JSONRes } from './res'
import { type Session } from '../routes/req'

// Imports
import { endpoint } from './setup'
import { app } from '../index'
import { expect } from '@jest/globals'

// Tests
// Check session config upload and download
describe('/init/session', () => {
  // Example session config
  const req = { timestamp: Date.now() }

  // Check for config
  describe('GET /init/session', () => {
    test('nonexistence handling', endpoint(app, '/init/session', (res: StdRes) => {
      expect(res.body.message).toBe('Session config does not exist.')
    }, { status: 404 }))
  })
  // Upload config
  describe('POST /init/session', () => {
    test('*', endpoint(app, '/init/session', (res: StdRes) => {
      expect(res.body.message).toBe('Session config successful.')
    }, {
      method: 'post',
      request: req
    }))
  })
  // Download config
  describe('GET /init/session', () => {
    test('retrieval', endpoint(app, '/init/session', (res: JSONRes) => {
      const data: Session = JSON.parse(res.text)
      expect(data.URL).toBe('::ffff:127.0.0.1')
    }))
  })
})

// Other initialization routines
describe('/init/*', () => {
  // Example ping request
  const req = { ping: 100 }

  // Check for config
  describe('POST /init/ping', () => {
    test('*', endpoint(app, '/init/ping', (res: StdRes) => {
      expect(res.body.message).toBe('Pong!')
    }, {
      method: 'post',
      request: req
    }))
  })
})

export {}
