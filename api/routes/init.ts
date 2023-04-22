// Initialize API

// Type definitions
import { type Config, type Session, type SessionReq } from './req'
import { type orderedList } from './utils'

// Imports
import { root } from '../index'
import * as path from 'path'
import * as fs from 'fs'
import * as express from 'express'

// Create router
const init = express.Router()

// Define methods
// Retrieve initial config
init.get('/', (_, res) => {
  const config = path.join(root, 'config.json')
  if (!fs.existsSync(config)) {
    return res.status(404).send('Config does not exist.')
  }
  const raw = fs.readFileSync(config, 'utf8')
  const data: Config = JSON.parse(raw)
  res.json(data)
})

// Upload initial config
init.post('/', (req, res) => {
  const reqConfig: Config = req.body
  const { user, languages, config } = reqConfig

  // Parse language lists
  const isOrderedList = (list: any): list is orderedList => {
    return (list as orderedList) !== undefined
  }
  const checkOrder = (list: orderedList) => {
    for (const item of list) {
      /* istanbul ignore next */
      if (item[1] < 0 || item[1] > 1) {
        throw new TypeError('Some items in ordered list have priority not in [0, 1]!')
      }
    }
    return list.sort((a, b) => b[1] - a[1])
  }
  if (isOrderedList(languages.native)) {
    languages.native = checkOrder(languages.native)
  }

  // Write to config
  fs.writeFileSync(
    path.join(root, 'config.json'),
    JSON.stringify({ user, languages, config }, null, 2)
  )

  res.json({
    message: 'Config successful.'
  })
})

// Retrieve session config
init.get('/session', (_, res) => {
  const session = path.join(root, 'session.json')
  if (!fs.existsSync(session)) {
    res.status(404).json({
      message: 'Session config does not exist.'
    })
    return
  }
  const raw = fs.readFileSync(session, 'utf8')
  const data: Session = JSON.parse(raw)
  res.json(data)
})

// Upload session config
init.post('/session', (req, res) => {
  // Collect request data
  const session: SessionReq = req.body
  const data = {
    URL: req.socket.remoteAddress,
    timestamp: Date.now(),
    delay: Date.now() - session.timestamp
  }

  // Write to config
  fs.writeFileSync(
    path.join(root, 'session.json'),
    JSON.stringify(data, null, 2)
  )

  res.json({
    message: 'Session config successful.'
  })
})

// Exports
export { init }
