// API endpoint

import { init } from './dirs.js'
import express from 'express'

const CONFIG = init()

const app = express()
const port = CONFIG.port

app.get('/', (req, res) => {
  res.send({
    message: 'Hello world!'
  })
})

app.listen(port, () => {
  console.log(`API listening on port ${port}`)
})
