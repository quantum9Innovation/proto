// Bridge for server-client communication

const log = async () => {
  const res = await fetch('http://localhost:3000/')

  if (res.ok) return await res.json()
  return {
    status: res.status,
    error: new Error(),
  }
}

export default log
