// file deepcode ignore PT: path traversal attacks prevented by backend logic

const deconstructVFS = () => {
  // Teardown VFS layout
  const title = document.getElementById('title')
  const content = document.getElementById('content')
  const score = document.getElementById('vfs-score')
  if (title !== null) title.remove()
  if (content !== null) content.remove()
  if (score !== null) score.remove()
}

const setVFSTitle = (title: string) => {
  // Change title
  if (document.getElementById('title') !== undefined) {
    const titleEl = document.createElement('h1')
    titleEl.id = 'title'
    titleEl.innerText = title
    document.body.appendChild(titleEl)
  } else (document.getElementById('title') as HTMLHeadingElement).innerText = title
}

const makeVFSContent = () => {
  // Build content
  const content = document.createElement('div')
  content.id = 'content'
  document.body.appendChild(content)
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
    if (dir === 'purged') continue

    const folder = document.createElement('div')
    folder.className = 'item folder'
    const folderText = document.createElement('span')
    folderText.innerText = dir
    const folderDel = document.createElement('button')
    folderDel.className = 'delete'
    folderDel.innerText = 'Delete'
    folderDel.addEventListener('click', e => {
      const del = confirm('Are you sure you want to delete ' + dir + '?')
      if (del) rm(dir).catch(e => { console.error(e) })
    })

    folder.appendChild(folderText)
    folder.appendChild(folderDel)
    filePreview.appendChild(folder)
    folderText.addEventListener('click', e => { cd(dir) })
  }
  for (const doc of docs) {
    if (doc === 'purged') continue

    const file = document.createElement('div')
    file.className = 'item document'
    const fileText = document.createElement('span')
    fileText.innerText = doc
    const fileDel = document.createElement('button')
    fileDel.className = 'delete'
    fileDel.innerText = 'Delete'
    fileDel.addEventListener('click', e => {
      const del = confirm('Are you sure you want to delete ' + doc + '?')
      if (del) rm(doc).catch(e => { console.error(e) })
    })
    const fileEdit = document.createElement('button')
    fileEdit.className = 'edit'
    fileEdit.innerText = 'Edit'
    fileEdit.addEventListener('click', e => { openEditor(doc) })

    file.appendChild(fileText)
    file.appendChild(fileDel)
    if (!(doc === 'session.json' || doc === 'grammar.json')) file.appendChild(fileEdit)
    filePreview.appendChild(file)
  }
}

const makeVFSRibbon = () => {
  const buttonRow = document.createElement('div')
  buttonRow.className = 'row'

  const createDocBtn = document.createElement('button')
  createDocBtn.id = 'create-doc'
  createDocBtn.innerText = 'Create Document'

  const createFolderBtn = document.createElement('button')
  createFolderBtn.id = 'create-folder'
  createFolderBtn.innerText = 'Create Folder'

  const startQueueBtn = document.createElement('button')
  startQueueBtn.id = 'start-queue'
  startQueueBtn.innerText = 'Start Queue'

  // Add event listeners
  createDocBtn.addEventListener('click', e => {
    const popup = document.getElementById('create-doc-popup')
    if (popup === null) return
    popup.className = 'popup show'
  })
  createFolderBtn.addEventListener('click', e => {
    const popup = document.getElementById('create-folder-popup')
    if (popup === null) return
    popup.className = 'popup show'
  })
  startQueueBtn.addEventListener('click', e => {
    openQueue(false).catch(e => { console.error(e) })
  })

  buttonRow.appendChild(createDocBtn)
  buttonRow.appendChild(createFolderBtn)
  buttonRow.appendChild(startQueueBtn)
  return buttonRow
}

const makeVFSPopups = () => {
  // Initialize popups array
  const popups = []

  // Create document popup
  const doc = document.createElement('div')
  doc.id = 'create-doc-popup'
  doc.className = 'popup hide'

  // Elements
  const docTitle = document.createElement('h2')
  docTitle.innerText = 'Create Document'
  const docNameField = document.createElement('input')
  docNameField.type = 'text'
  docNameField.id = 'create-doc-name'
  const docClose = document.createElement('button')
  docClose.id = 'create-doc-close'
  docClose.className = 'close'
  docClose.innerText = 'Close'
  const docSubmit = document.createElement('button')
  docSubmit.id = 'create-doc-submit'
  docSubmit.className = 'submit'
  docSubmit.innerText = 'Create'

  // Add to popups
  doc.appendChild(docTitle)
  doc.appendChild(docNameField)
  doc.appendChild(docClose)
  doc.appendChild(docSubmit)
  popups.push(doc)

  // Create folder popup
  const folder = document.createElement('div')
  folder.id = 'create-folder-popup'
  folder.className = 'popup hide'

  // Elements
  const folderTitle = document.createElement('h2')
  folderTitle.innerText = 'Create Folder'
  const folderNameField = document.createElement('input')
  folderNameField.type = 'text'
  folderNameField.id = 'create-folder-name'
  const folderClose = document.createElement('button')
  folderClose.id = 'create-folder-close'
  folderClose.className = 'close'
  folderClose.innerText = 'Close'
  const folderSubmit = document.createElement('button')
  folderSubmit.id = 'create-folder-submit'
  folderSubmit.className = 'submit'
  folderSubmit.innerText = 'Create'

  // Add event listeners
  docClose.addEventListener('click', e => { doc.className = 'popup hide' })
  docSubmit.addEventListener('click', e => {
    touch(docNameField.value).catch(e => { console.error(e) })
  })
  folderClose.addEventListener('click', e => { folder.className = 'popup hide' })
  folderSubmit.addEventListener('click', e => {
    mkdir(folderNameField.value).catch(e => { console.error(e) })
  })

  // Add to popups
  folder.appendChild(folderTitle)
  folder.appendChild(folderNameField)
  folder.appendChild(folderClose)
  folder.appendChild(folderSubmit)
  popups.push(folder)

  return popups
}

const hideVFSPopups = () => {
  const popups = document.getElementsByClassName('popup')
  for (const popup of popups) {
    if (popup.classList.contains('show') || !popup.classList.contains('hide')) {
      popup.classList.remove('show')
      popup.classList.add('hide')
    }
  }
  const inputs = document.getElementsByTagName('input')
  for (const input of inputs) {
    if (input.type === 'text') input.value = ''
  }
}

const buildFiles = (dir: string) => {
  // Build content for file selector
  let content = document.getElementById('content')
  if (content === null) {
    makeVFSContent()
    content = document.getElementById('content')
  }

  // Append create buttons
  const buttonRow = makeVFSRibbon()
  content!.appendChild(buttonRow)

  // Make popups
  const popups = makeVFSPopups()
  for (const popup of popups) content!.appendChild(popup)

  // Read files
  readFiles(dir).then(items => {
    // Build file selector
    const dirs: string[] = items.folders
    const docs: string[] = items.documents
    const filePreview = document.createElement('div')
    filePreview.id = 'file-preview'
    content!.appendChild(filePreview)
    if (dir !== '/') dirs.splice(0, 0, '..')
    putFiles(dirs, docs)
  }).catch(e => { console.error(e) })

  // Show score
  getScore(false).then(score => {
    if (score === undefined) return
    const scoreEl = makeScore(score)
    scoreEl.id = 'vfs-score'
    document.body.appendChild(scoreEl)
  }).catch(e => { console.error(e) })
}

const showDir = (dir: string) => {
  const filePreview = document.getElementById('file-preview')
  if (filePreview !== null) filePreview.innerHTML = ''
  readFiles(dir).then(items => {
    // Build file selector
    const dirs: string[] = items.folders
    const docs: string[] = items.documents
    if (dir !== '/') dirs.splice(0, 0, '..')
    putFiles(dirs, docs)
  }).catch(e => { console.error(e) })

  // Show score
  getScore(false).then(score => {
    let scoreEl = document.getElementById('vfs-score')
    if (scoreEl !== null) scoreEl.remove()
    if (score === undefined) return
    scoreEl = makeScore(score)
    scoreEl.id = 'vfs-score'
    document.body.appendChild(scoreEl)
  }).catch(e => { console.error(e) })
}

window.exports = {
  deconstructVFS,
  setVFSTitle,
  makeVFSContent,
  hideVFSPopups,
  buildFiles,
  showDir
}
