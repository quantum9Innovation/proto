// Main application launcher
// This is not an entry point!
// > See ./run.ts or use `node .`

// Type definitions
import { type Config } from './config'
import { type Router } from 'express'

// Imports
import untildify = require('untildify')
import helmet from 'helmet'
import * as fs from 'fs'
import * as path from 'path'
import * as express from 'express'
import * as bodyParser from 'body-parser'

// Route imports
import { init } from './routes/init'
import { vfs } from './routes/vfs'
import { card, rescore } from './routes/card'

// Get version info
const CONFIG: Config = JSON.parse(fs.readFileSync('./config.json', 'utf8'))
const EXPRESS_VERSION: string = JSON.parse(
  fs.readFileSync('./package.json', 'utf8')
)
  .dependencies
  .express

// Create app
const app = express()
const ROOT = untildify(CONFIG.root)
const LOC = path.join(__dirname, '..')
let host = CONFIG.host
let port = CONFIG.port

/* istanbul ignore next */
if (host == null) host = 'localhost'
/* istanbul ignore next */
if (port == null) port = 3000

// Define routes
const routes: Record<string, Router> = {
  '/api/init': init,
  '/api/vfs': vfs,
  '/api/card': card
}

// Create root dir
/* istanbul ignore else */
if (!fs.existsSync(ROOT)) fs.mkdirSync(ROOT)

// Recalculate all scores
else {
  const languages: string[] = []
  fs.readdirSync(ROOT, { withFileTypes: true }).forEach(pathname => {
    if (pathname.isDirectory() && pathname.name.includes('lang')) languages.push(pathname.name)
  })
  languages.forEach(lang => { rescore(lang, lang) })
}

// Configure app
const INFO = 'Local Proto server listening on port '
             + `<a href='http://${host}:${port}'>http://${host}:${port}</a>`
             + '<br>\n'
             + `Running Express ${EXPRESS_VERSION} `
             + `on Node ${process.version}<br>\n`
             + 'Serving as text/html; charset=utf-8 with status code 200'
app.use(helmet())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.get('/api', (_, res) => {
  res.send(INFO)
})

// Initialize frontend
/* istanbul ignore next */
app.get('/', (_, res) => {
  res.sendFile('frontend/index.html', { root: LOC }, e => {
    if (e !== undefined) {
      console.error(e)
      res.status(500).send('Internal server error; frontend could not be loaded.')
    }
  })
})
app.use('/frontend', express.static(path.join(LOC, 'frontend')))

// Load routes
for (const route in routes) app.use(route, routes[route])

// Start API
const msg = `Listening on http://${host}:${port}`
export {
  app,
  host, port,
  msg,
  ROOT as root,
  LOC as loc
}
