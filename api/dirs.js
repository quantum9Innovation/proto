// Interact with application directories

import fs from 'fs'
import path from 'path'
import process from 'process'
import envPaths from 'env-paths'
import superconf from 'superconf'

const PATHS = envPaths('proto', { suffix: '' })

/**
 * Initialize application directories,
 * and load configuration.
 * @returns {object} Configuration object
 */
const init = () => {
  const config = PATHS.config

  // Create config directory if it doesn't already exist
  if (!fs.existsSync(config)) {
    fs.mkdirSync(config)
  }

  // Find config
  const file = path.join(config, 'config.json')
  let data
  if (!fs.existsSync(file)) data = {}
  else data = JSON.parse(fs.readFileSync(file, 'utf8'))

  // Merge config
  const defaults = {
    port: '3000'
  }
  const merged = superconf.merge(defaults, data)

  // Copy config
  const app = path.join(process.cwd(), 'src/lib/app.json')
  fs.writeFileSync(app, JSON.stringify(merged))

  return merged
}

export {
  PATHS,
  init
}
