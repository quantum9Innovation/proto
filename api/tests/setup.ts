// Setup Jest for all tests

// Type definitions
import { type Express } from 'express'

// Imports
import * as fs from 'fs'
import * as supertest from 'supertest'

// Setup
global.afterAll(() => {
  // Wipe storage prior to next run
  if (fs.existsSync('./storage')) fs.rmSync('./storage', { recursive: true, force: true })
})
test.skip('cleanup', () => {})

// Base test
const endpoint = (
  app: Express, URL: string, callback: any,
  options: {
    status?: 200 | 400 | 403 | 404 | 500
    method?: 'get' | 'post' | 'delete'
    contentType?: string
    request?: string | object
  } = {}
) => {
  if (typeof options.status === 'undefined') options.status = 200
  if (typeof options.method === 'undefined') options.method = 'get'
  if (typeof options.contentType === 'undefined') {
    options.contentType = 'application/json; charset=utf-8'
  }
  URL = '/api' + URL
  return async () => {
    switch (options.method) {
      case 'get': {
        await supertest(app).get(URL)
          .query(options.request ?? '')
          .expect(options.status as number)
          .expect('Content-Type', options.contentType as string)
          .then(callback)
        break
      }
      case 'post': {
        await supertest(app).post(URL)
          .send(options.request)
          .expect(options.status as number)
          .expect('Content-Type', options.contentType as string)
          .then(callback)
        break
      }
      case 'delete': {
        await supertest(app).delete(URL)
          .query(options.request ?? '')
          .expect(options.status as number)
          .expect('Content-Type', options.contentType as string)
          .then(callback)
        break
      }
    }
  }
}

export { endpoint }
