// Test all endpoints in init/

// Type definitions
import { StdRes, JSONRes } from './res'
import { Session } from '../routes/req'

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
      expect(req.timestamp + data.delay).toBeGreaterThan(data.timestamp - 5)
      expect(req.timestamp + data.delay).toBeLessThan(data.timestamp + 5)
    }))
  })
})

export {}
