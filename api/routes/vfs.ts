// Virtual File System (VFS)

// Type definitions
import { type Document } from './req'

// Imports
import { root, loc } from '../index'
import * as fs from 'fs'
import * as path from 'path'
import * as express from 'express'

// Create router
const vfs = express.Router()

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
  const pathname = path.join(root, uri)

  // Check resource
  if (!fs.existsSync(pathname)) return res.status(404).send('Resource not found.')
  const isFile = fs.statSync(pathname).isFile()
  const isDirectory = fs.statSync(pathname).isDirectory()
  /* istanbul ignore next */
  if (!isFile && !isDirectory) return res.status(500).send('Resource type could not be determined.')

  // Serve resource
  if (isFile) res.sendFile(pathname, { root: loc })
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
  const name = path.join(root, loc)

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
  loc = path.join(root, loc)

  // Check if modifying protected trash directory
  if (loc.includes('purged')) return res.status(403).send('Modifying trash directory disallowed.')
  // Check if location doesn't exist
  if (!fs.existsSync(loc)) return res.status(404).send('Location does not exist.')
  // Check if location is a directory
  if (!fs.statSync(loc).isDirectory()) {
    return res.status(400).send('Location is not a valid directory.')
  }

  // Write to file
  fs.writeFileSync(path.join(loc, name) + '.json', JSON.stringify(content))

  res.json({
    message: 'Document uploaded successfully.'
  })
})

// Define DELETE methods
// Delete resource
vfs.delete('/resource', (req, res) => {
  const loc = req.query.loc as string
  const name = path.join(root, loc)

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
  const trashPath = path.join(TRASH, loc.split(path.sep).join('-'))
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
