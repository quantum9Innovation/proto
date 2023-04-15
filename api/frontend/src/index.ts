// Globals
let scene = 'init'
let pwd = '/'
let editing = ''
let cards: any[] = []
let noCorrect = 0
let progress: number = 0
let configCache: any

// Scene managers
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
  buildQueueCard(cards[0], config)
  updateProgressBar(0)
  configCache = config
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

const startReview = async (card: any, rec: any, correct: boolean) => {
  // Start queue review

  /*
    Update card history
    As of right now, all properties tested with the card are not updated.
    Instead, these scores are merged into the overall card score.
  */
  const res = await fetch('/api/card/history', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: card.id,
      timestamp: Date.now(),
      accuracy: correct
    })
  })

  // Error handling
  if (res.status !== 200) {
    const e = await res.text()
    console.error(e)
    alert(e)
  }

  // Update local variables
  if (correct) {
    cards.splice(0, 1)
    noCorrect++
  } else {
    const forReview = cards.splice(0, 1)[0]
    cards.push(forReview)
  }
  rec = JSON.stringify(rec)

  let scoreSum = 0
  for (const card of cards) {
    if (card.history === undefined) continue
    if (card.history.score === undefined) continue
    scoreSum += card.history.score as number
  }
  scoreSum += noCorrect

  let score = 0
  if (card.history?.score !== undefined) score = card.history.score

  const stats = [score, scoreSum / (cards.length + noCorrect)]

  // Switch to review
  refreshQueue()
  buildQueueReview(correct, card, rec, stats)
  progress = noCorrect / (cards.length + noCorrect)
  updateProgressBar(progress)
}

const restartQueue = () => {
  // Restart queue
  if (cards.length === 0) {
    openVFS()
    return
  }
  refreshQueue()
  buildQueueCard(cards[0], configCache)
  updateProgressBar(progress)
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
  noCorrect = 0
  if (cards.length !== 0) queue(config)
  else alert('No cards to study')
}

// Export callables
window.exports = {
  cd,
  mkdir,
  touch,
  rm,
  addCard,
  deleteCard,
  startReview,
  restartQueue,
  openVFS,
  openEditor,
  openQueue
}
