// Bridge for server-client communication

import { port } from './app.json'
const API = `http://localhost:${port}/`

/**
 * Establish communication with server
 * @returns {Promise<object>} Result of server `GET` request
 */
const log = async () => {
  const res = await fetch(API)

  if (res.ok) return await res.json()
  return {
    status: res.status,
    error: new Error(),
  }
}

export default log
