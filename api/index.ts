// Main application launcher
// This is not an entry point!
// > See ./run.ts or use `node .`

// Type definitions
import { type Config } from './config.js'
import { type Router } from 'express'

// Imports
import helmet from 'helmet'
import untildify from 'untildify'
import * as fs from 'fs'
import * as path from 'path'
import * as http from 'http'
import * as https from 'https'
import * as crypto from 'crypto'
import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import * as RateLimit from 'express-rate-limit'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// Route imports
import { init } from './routes/init.js'
import { vfs } from './routes/vfs.js'
import { card, rescore } from './routes/card.js'

// Get version info
const CONFIG: Config = JSON.parse(fs.readFileSync('./config.json', 'utf8'))
const PROTO_VERSION: string = JSON.parse(fs.readFileSync('./package.json', 'utf8')).version
const EXPRESS_VERSION: string = JSON.parse(
  fs.readFileSync('./package.json', 'utf8')
)
  .dependencies
  .express

// Create app
// deepcode ignore UseCsurfForExpress: already handled by helmet middleware
const app = express()
const apiLimiter = RateLimit.rateLimit({
  windowMs: 1000 * 60,
  max: 1000,
  headers: true
})
const ROOT = untildify(CONFIG.root)

// eslint-disable-next-line @typescript-eslint/naming-convention
const __filename = fileURLToPath(import.meta.url)
// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = dirname(__filename)
const LOC = path.join(__dirname, '..')
/* istanbul ignore next */
const HTTPS = CONFIG.https ?? false
const host = CONFIG.host ?? 'localhost'
const port = CONFIG.port ?? 3000
let httpsKey
let httpsCert

/* istanbul ignore next */
if (HTTPS !== false) {
  let { key, cert } = HTTPS
  key = untildify(key)
  cert = untildify(cert)
  httpsKey = fs.readFileSync(key)
  httpsCert = fs.readFileSync(cert)
}

/* istanbul ignore next */
if (CONFIG.settings !== undefined) {
  if (CONFIG.settings.limit !== undefined) app.set('limit', CONFIG.settings.limit)
  if (CONFIG.settings.skipIfCorrect !== undefined) app.set('skipIfCorrect', CONFIG.settings.skipIfCorrect)
}

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
/* istanbul ignore next */
const URL_PREFIX = HTTPS !== false ? 'https' : 'http'
const INFO = `Local Proto (v${PROTO_VERSION}) server listening on port `
             + `<a href='${URL_PREFIX}://${host}:${port}'>${URL_PREFIX}://${host}:${port}</a>`
             + '<br>\n'
             + `Running Express ${EXPRESS_VERSION} `
             + `on Node ${process.version}<br>\n`
             + `Serving as text/html; charset=utf-8 with status code 200 over ${URL_PREFIX}`
app.use(apiLimiter)
app.use(helmet())
app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.get('/api', (_, res) => {
  res.send(INFO)
})

// Custom middleware to check PIN
/* istanbul ignore next */
if (HTTPS !== false && HTTPS.pin !== undefined) {
  app.use((req, res, next) => {
    if (req.path.includes('/frontend') || req.path === '/') {
      // Allow accessing frontend static assets
      next()
      return
    }
    if (req.cookies.pin === undefined) {
      res.status(403).send('Forbidden')
      return
    }
    const received = Buffer.from(req.cookies.pin, 'utf8')
    const pin = Buffer.from(HTTPS.pin!, 'utf8')
    let equal: boolean
    try {
      equal = crypto.timingSafeEqual(received, pin)
    } catch (e) { equal = false }
    if (equal) next()
    else res.status(403).send('Forbidden')
  })
}

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
const options = {
  key: httpsKey,
  cert: httpsCert
}
/* istanbul ignore next */
// deepcode ignore HttpToHttps: this is set by user config
const server = HTTPS !== false ? https.createServer(options, app) : http.createServer(app)
const msg = `Listening on ${URL_PREFIX}://${host}:${port}`
export {
  server, app,
  host, port,
  msg,
  ROOT as root,
  LOC as loc
}
