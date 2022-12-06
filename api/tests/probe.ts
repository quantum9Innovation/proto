// Probe all top-level API endpoints

// Type definitions
import { StdRes, JSONRes } from './res'

// Imports
import { endpoint } from './setup'
import { app } from '../index'
import { expect, describe, test } from '@jest/globals'

// Tests
// Check if API is running
test('GET /', endpoint(app, '/', () => {}, { contentType: 'text/html; charset=utf-8' }))

// Check config upload and download
describe('/init', () => {
  // Example config
  const req = {
    user: {
      name: 'Jest',
      email: 'jest@example.com',
      start: new Date()
    },
    languages: {
      ui: 'en-US',
      native: [['en-US', 1], ['es-MX', 0.9]],
      target: 'am-ET'
    },
    config: {}
  }

  // Check for config
  describe('GET /init', () => {
    test('nonexistence handling', endpoint(app, '/init', (res: JSONRes) => {
      expect(res.text).toBe('Config does not exist.')
    }, {
      contentType: 'text/html; charset=utf-8',
      status: 404
    }))
  })
  // Upload config
  describe('POST /init', () => {
    test('*', endpoint(app, '/init', (res: StdRes) => {
      expect(res.body.message).toBe('Config successful.')
    }, {
      method: 'post',
      request: req
    }))
  })
  // Download config
  describe('GET /init', () => {
    test('retrieval', endpoint(app, '/init', (res: JSONRes) => {
      // Convert date string back to `Date` object before comparison
      const data = JSON.parse(res.text)
      data.user.start = new Date(data.user.start)
      expect(data).toStrictEqual(req)
    }))
  })
})

export {}
