const setTitle = (title: string) => {
  // Change title
  if (document.getElementById('title') !== undefined) {
    const titleEl = document.createElement('h1')
    titleEl.id = 'title'
    titleEl.innerText = title
    document.body.appendChild(titleEl)
  } else (document.getElementById('title') as HTMLHeadingElement).innerText = title
}

const makeContent = () => {
  // Build content
  const content = document.createElement('div')
  content.id = 'content'
  document.body.appendChild(content)
}

const reset = () => {
  // Reset all content
  const content = document.getElementById('content')
  if (content !== null) content.innerHTML = ''
}

const readFiles = async (dir: string) => {
  // Read files in specified directory
  const res = await fetch('/api/vfs/serve?' + new URLSearchParams({ path: dir }).toString())
  const files = await res.json()
  return files
}

const putFiles = (dirs: string[], docs: string[]) => {
  const filePreview = document.getElementById('file-preview')
  if (filePreview === null) return
  for (const dir of dirs) {
    const folder = document.createElement('div')
    folder.className = 'item folder'
    folder.innerText = dir
    filePreview.appendChild(folder)
    folder.addEventListener('click', e => { cd(dir) })
  }
  for (const doc of docs) {
    const folder = document.createElement('div')
    folder.className = 'item document'
    folder.innerText = doc
    filePreview.appendChild(folder)
  }
}

const buildFiles = () => {
  // Build content for file selector
  let content = document.getElementById('content')
  if (content === null) {
    makeContent()
    content = document.getElementById('content')
  }
  readFiles('/').then(items => {
    // Build file selector
    const dirs: string[] = items.folders
    const docs: string[] = items.documents
    const filePreview = document.createElement('div')
    filePreview.id = 'file-preview'
    content!.appendChild(filePreview)
    putFiles(dirs, docs)
  }).catch(e => { console.error(e) })
}

const showDir = (dir: string) => {
  const filePreview = document.getElementById('file-preview')
  if (filePreview !== null) filePreview.innerHTML = ''
  readFiles(dir).then(items => {
    // Build file selector
    const dirs: string[] = items.folders
    const docs: string[] = items.documents
    const subdirs = dir.split('/')
    let traversals = subdirs.length - 2
    for (const subdir of subdirs) {
      if (subdir === '..') traversals -= 2
    }
    if (traversals > 0) dirs.splice(0, 0, '..')
    putFiles(dirs, docs)
  }).catch(e => { console.error(e) })
}

window.exports = {
  setTitle,
  reset,
  makeContent,
  buildFiles,
  showDir
}
