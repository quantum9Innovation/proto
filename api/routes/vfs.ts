// Virtual File System (VFS)

// Type definitions
import { type Document } from './req'

// Imports
import { root } from '../index'
import * as fs from 'fs'
import * as path from 'path'
import * as express from 'express'

// Create router
const vfs = express.Router()

// Prevent directory traversal attacks
const checkPrefix = (prefix: string, candidate: string) => {
  /* See: https://security.stackexchange.com/a/123723 */
  // .resolve() removes trailing slashes
  const absPrefix = path.resolve(prefix) + path.sep
  const absCandidate = path.resolve(candidate) + path.sep
  return absCandidate.substring(0, absPrefix.length) === absPrefix
}
const safeSuffix = (unsafeSuffix: string, basePath: string) => {
  /* See: https://security.stackexchange.com/a/123723 */
  const safeSuffix = path.normalize(unsafeSuffix).replace(/^(\.\.(\/|\\|$))+/, '')
  const safeJoin = path.join(basePath, safeSuffix)
  return safeJoin
}

// Define GET methods
// Show top-level outline
vfs.get('/', (_, res) => {
  const documents: string[] = []
  const folders: string[] = []

  // Process top-level outline
  fs.readdirSync(root, { withFileTypes: true }).forEach(pathname => {
    if (pathname.isDirectory()) folders.push(pathname.name)
    else if (pathname.isFile()) documents.push(pathname.name)
  })

  res.json({ documents, folders })
})

// Browse path or get resource
vfs.get('/serve', (req, res) => {
  const uri = req.query.path as string
  /* TODO: (security) sanitize uri path */
  const pathname = safeSuffix(uri, root)
  /* istanbul ignore if */
  if (!checkPrefix(root, pathname)) return res.status(404).send('Resource not found.')

  // Check resource
  if (!fs.existsSync(pathname)) return res.status(404).send('Resource not found.')
  const isFile = fs.statSync(pathname).isFile()
  const isDirectory = fs.statSync(pathname).isDirectory()
  /* istanbul ignore next */
  if (!isFile && !isDirectory) return res.status(500).send('Resource type could not be determined.')

  // Serve resource
  if (isFile) res.sendFile(uri, { root })
  else {
    const documents: string[] = []
    const folders: string[] = []

    // Process directory-level outline
    fs.readdirSync(pathname, { withFileTypes: true }).forEach(subpath => {
      if (subpath.isDirectory()) folders.push(subpath.name)
      else if (subpath.isFile()) documents.push(subpath.name)
    })

    res.json({ documents, folders })
  }
})

// Define POST methods
// Create folder
vfs.post('/folder', (req, res) => {
  const loc: string = req.body.loc
  const name = safeSuffix(loc, root)
  /* istanbul ignore if */
  if (!checkPrefix(root, name)) return res.status(404).send('Location not found.')

  // Check if modifying protected trash directory
  if (loc.includes('purged')) return res.status(403).send('Modifying trash directory disallowed.')
  // Check if location already exists
  if (fs.existsSync(name)) return res.status(400).send('Location already exists.')
  // Create location
  fs.mkdirSync(name, { recursive: true })

  res.json({
    message: 'Folder created successfully.'
  })
})

// Create or replace document
vfs.post('/document', (req, res) => {
  const document: Document = req.body
  let { loc, name, content } = document
  loc = safeSuffix(loc, root)
  /* istanbul ignore if */
  if (!checkPrefix(root, loc)) return res.status(404).send('Location not found.')
  name = safeSuffix(name, loc)
  /* istanbul ignore if */
  if (!checkPrefix(loc, name)) return res.status(404).send('Location not found.')

  // Check if modifying protected trash directory
  if (loc.includes('purged')) return res.status(403).send('Modifying trash directory disallowed.')
  // Check if location doesn't exist
  if (!fs.existsSync(loc)) return res.status(404).send('Location does not exist.')
  // Check if location is a directory
  if (!fs.statSync(loc).isDirectory()) {
    return res.status(400).send('Location is not a valid directory.')
  }

  // Write to file
  fs.writeFileSync(name + '.json', JSON.stringify(content, null, 2))

  res.json({
    message: 'Document uploaded successfully.'
  })
})

// Define DELETE methods
// Delete resource
vfs.delete('/resource', (req, res) => {
  const loc = req.query.loc as string
  const name = safeSuffix(loc, root)
  /* istanbul ignore if */
  if (!checkPrefix(root, name)) {
    return res.status(200).send('Location does not exist; no deletion performed.')
  }

  // Check if trash directory exists
  const TRASH = path.join(root, 'purged')
  if (!fs.existsSync(TRASH)) fs.mkdirSync(TRASH)
  // Check if deleting protected trash directory
  if (loc.includes('purged')) {
    return res
      .status(403)
      .send(
        'Cannot delete from trash with client-side request; '
        + 'this action must be taken from the server.'
      )
  }
  // Check if location exists
  if (!fs.existsSync(name)) {
    return res.status(200).send('Location does not exist; no deletion performed.')
  }

  // Generate new path, including folders in filename
  const trashPath = safeSuffix(loc.split(path.sep).join('-'), TRASH)
  /* istanbul ignore if */
  if (!checkPrefix(TRASH, trashPath)) return res.status(404).send('Deletion failed.')
  // Check if target path already exists
  if (fs.existsSync(trashPath)) fs.rmSync(trashPath, { recursive: true })
  // Move directory to target path
  fs.renameSync(name, trashPath)

  res.json({
    message: 'Resource moved to trash.'
  })
})

// Exports
export { vfs }
