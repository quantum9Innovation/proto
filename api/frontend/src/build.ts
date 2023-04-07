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
    if (dir === 'purged') continue

    const folder = document.createElement('div')
    folder.className = 'item folder'
    const folderText = document.createElement('span')
    folderText.innerText = dir
    const folderDel = document.createElement('button')
    folderDel.className = 'delete'
    folderDel.innerText = 'Delete'
    folderDel.addEventListener('click', e => {
      rm(dir).catch(e => { console.error(e) })
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
      rm(doc).catch(e => { console.error(e) })
    })

    file.appendChild(fileText)
    file.appendChild(fileDel)
    filePreview.appendChild(file)
  }
}

const makeButtonRow = () => {
  const buttonRow = document.createElement('div')
  buttonRow.className = 'row'

  const createDocBtn = document.createElement('button')
  createDocBtn.id = 'create-doc'
  createDocBtn.innerText = 'Create Document'

  const createFolderBtn = document.createElement('button')
  createFolderBtn.id = 'create-folder'
  createFolderBtn.innerText = 'Create Folder'

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

  buttonRow.appendChild(createDocBtn)
  buttonRow.appendChild(createFolderBtn)
  return buttonRow
}

const makePopups = () => {
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

const hidePopups = () => {
  const popups = document.getElementsByClassName('popup')
  for (const popup of popups) {
    if (popup.classList.contains('show') || !popup.classList.contains('hide')) {
      popup.classList.remove('show')
      popup.classList.add('hide')
    }
  }
}

const buildFiles = () => {
  // Build content for file selector
  let content = document.getElementById('content')
  if (content === null) {
    makeContent()
    content = document.getElementById('content')
  }

  // Append create buttons
  const buttonRow = makeButtonRow()
  content!.appendChild(buttonRow)

  // Make popups
  const popups = makePopups()
  for (const popup of popups) content!.appendChild(popup)

  // Read files
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
    if (dir !== '/') dirs.splice(0, 0, '..')
    putFiles(dirs, docs)
  }).catch(e => { console.error(e) })
}

window.exports = {
  setTitle,
  reset,
  makeContent,
  hidePopups,
  buildFiles,
  showDir
}
