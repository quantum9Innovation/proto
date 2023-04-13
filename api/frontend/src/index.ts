// Globals
let scene = 'init'
let pwd = '/'
let editing = ''
let cards: any[] = []

// Scene managers
/**
  TODO: Study window

  Separately tested grammar properties should be eliminated from returned cards, if present
  All cards have base form: `{ term, definition, history, id }`

  Returned cards should be parsed for testable grammar properties and a scene should be constructed
  which creates a study session, which operates independently from the main routine given a list of
  cards to study as input on startup.
*/
const register = async () => {
  const res = await fetch('/api/init/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ timestamp: Date.now() })
  })
  if (res.status !== 200) {
    const e = await res.text()
    console.error('Failed to establish connection!\nReload to try again.')
    console.error(e)
    alert(e)
  }
}
const deconstruct = () => {
  switch (scene) {
    case 'init': break
    case 'vfs':
      deconstructVFS()
      break
    case 'editor':
      deconstructEditor()
      break
    case 'queue':
      deconstructQueue()
      break
  }
}
const vfs = () => {
  deconstruct()
  scene = 'vfs'
  setVFSTitle('Files')
  makeVFSContent()
  buildFiles(pwd)
}
const editor = (config: any) => {
  deconstruct()
  scene = 'editor'
  setEditorTitle('Document Editor')
  makeEditorContent()
  buildEditor(editing, config)
}
const queue = (config: any) => {
  deconstruct()
  scene = 'queue'
  setQueueTitle('Queue')
  makeQueueContent()
  buildQueueCard(cards[cards.length - 1], config)
  updateProgressBar(0)
}

// Startup routine
register().catch(e => { console.error(e) })
vfs()

// Helper funcs
const traverse = (dir: string) => {
  const paths = dir.split('/')
  paths.splice(paths.length - 2, 2)
  return paths.join('/') + '/'
}
const resolveLang = () => {
  // Get language of current document
  if (!pwd.includes('lang')) return 'UNKNOWN'
  const lang = pwd.split('lang-')[1].split('/')[0]
  return 'lang-' + lang
}
const sanitize = (dirname: string) => dirname.replace(/[^a-z0-9]/gi, '-')

// Define callables
const cd = (dir: string) => {
  // Change directory
  if (dir !== '..') pwd += dir + '/'
  else pwd = traverse(pwd)
  hideVFSPopups()
  showDir(pwd)
}

const mkdir = async (dir: string) => {
  // Make directory
  const dirname = sanitize(dir)
  if (dirname === 'purged') {
    alert('This is a reserved name')
    return
  }
  const loc = pwd + dirname
  const res = await fetch('/api/vfs/folder', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ loc })
  })

  // Error handling
  if (res.status !== 200) {
    const e = await res.text()
    console.error(e)
    alert(e)
  }

  // Refresh view
  hideVFSPopups()
  showDir(pwd)
}

const touch = async (file: string) => {
  // Create document
  const filename = sanitize(file)
  if (filename === 'purged') {
    alert('This is a reserved name')
    return
  }
  const content = {}
  const res = await fetch('/api/vfs/document', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ loc: pwd, name: filename, content })
  })

  // Error handling
  if (res.status !== 200) {
    const e = await res.text()
    console.error(e)
    alert(e)
  }

  // Refresh view
  hideVFSPopups()
  showDir(pwd)
}

const rm = async (name: string) => {
  // Delete resource
  let loc = pwd + name
  if (name === '..') loc = pwd
  const res = await fetch(
    '/api/vfs/resource?'
    + new URLSearchParams({ loc }).toString(),
    { method: 'DELETE' }
  )

  // Error handling
  if (res.status !== 200) {
    const e = await res.text()
    console.error(e)
    alert(e)
  }

  // Refresh view
  if (name === '..') cd(name)
  else showDir(pwd)
}

const addCard = async (card: any) => {
  // Add card to document
  const res = await fetch('/api/card/add?', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      loc: editing,
      lang: resolveLang(),
      card
    })
  })

  // Error handling
  if (res.status !== 200) {
    const e = await res.text()
    console.error(e)
    alert(e)
  }

  // Refresh view
  resetCardInputs()
  showCards(editing)
}

const deleteCard = async (i: number) => {
  // Delete card in document
  const res = await fetch(
    '/api/card/remove?'
    + new URLSearchParams({ loc: editing, index: i.toString() }).toString(),
    { method: 'DELETE' }
  )

  // Error handling
  if (res.status !== 200) {
    const e = await res.text()
    console.error(e)
    alert(e)
  }

  // Refresh view
  showCards(editing)
}

const getGrammar = async () => {
  // Fetch grammar config and update the `grammar` object to match
  const res = await fetch('/api/card?' + new URLSearchParams({ lang: resolveLang() }).toString())
  if (res.status !== 200) {
    const e = await res.text()
    console.error(e)
    alert(e)
  }
  const grammar = await res.json()
  return grammar
}

const openVFS = () => { vfs() }
const openEditor = (doc: string) => {
  editing = pwd + doc
  getGrammar()
    .then(config => { editor(config) })
    .catch(e => { console.error(e) })
}
const openQueue = async (doc: boolean) => {
  const res = await fetch(
    '/api/card/list?'
    + new URLSearchParams({
      path: doc ? editing : pwd,
      lang: resolveLang()
    }).toString()
  )
  const config = await getGrammar()

  // Error handling
  if (res.status !== 200) {
    const e = await res.text()
    console.error(e)
    alert(e)
  }

  // Open queue
  cards = await res.json()
  queue(config)
}

// Export callables
window.exports = {
  cd,
  mkdir,
  touch,
  rm,
  addCard,
  deleteCard,
  openVFS,
  openEditor,
  openQueue
}
