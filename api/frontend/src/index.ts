// Globals
let scene = 'init'
let pwd = '/'
let editing = ''
let cards: any[] = []
let noCorrect = 0
let progress: number = 0
let configCache: any
let limit: number

// Scene managers
const setTheme = (name: 'light' | 'dark') => {
  // Set theme
  localStorage.setItem('theme', name)
  document.body.className = name

  // Purge existing stylesheets
  const water = document.getElementById('water')
  if (!(water === null || water === undefined)) document.head.removeChild(water)

  // Load water.css stylesheets
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.id = 'water'
  if (name === 'dark') {
    link.href = 'https://cdn.jsdelivr.net/npm/water.css@2/out/dark.css'
  } else {
    link.href = 'https://cdn.jsdelivr.net/npm/water.css@2/out/light.css'
  }
  document.head.appendChild(link)
}

const loadTheme = () => {
  // Load theme from local storage
  if (localStorage.getItem('theme') === 'dark') setTheme('dark')
  else setTheme('light')
}

const toggleTheme = () => {
  // Change theme to opposite
  if (localStorage.getItem('theme') === 'dark') setTheme('light')
  else setTheme('dark')
}

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
  /* eslint-disable-next-line @typescript-eslint/restrict-plus-operands */
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

const getLimit = async () => {
  // Fetch queue limit
  const res = await fetch('/api/card/limit')
  if (res.status !== 200) {
    const e = await res.text()
    console.error(e)
    alert(e)
  }
  const data = await res.json()
  limit = data.limit
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
    if (limit - noCorrect - 1 > cards.length) cards.push(forReview)
    else if (limit - noCorrect - 1 < 0) cards.splice(0, 0, forReview)
    else cards.splice(limit - noCorrect - 1, 0, forReview)
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
  progress = noCorrect / limit
  updateProgressBar(Math.min(progress, 1))
}

const restartQueue = () => {
  // Restart queue
  if (cards.length === 0) {
    openVFS()
    return
  }
  refreshQueue()
  buildQueueCard(cards[0], configCache)
  updateProgressBar(Math.min(progress, 1))
}

const makeScore = (score: number) => {
  // Create score element
  const scoreEl = document.createElement('div')
  scoreEl.className = 'score'
  scoreEl.innerText = score === 0 ? '0' : score.toPrecision(3)

  // Colors
  const ZERO = [156, 47, 47]
  const MIDPOINT = [198, 168, 9]
  const ONE = [8, 154, 6]
  const OPACITY = 0.5
  const blend = (c1: number[], c2: number[], p: number) => [
    c1[0] * (1 - p) + c2[0] * p,
    c1[1] * (1 - p) + c2[1] * p,
    c1[2] * (1 - p) + c2[2] * p
  ]
  if (score < 0.5) {
    const bg = blend(ZERO, MIDPOINT, score / 0.5)
    scoreEl.style.backgroundColor = `rgba(${bg[0]}, ${bg[1]}, ${bg[2]}, ${OPACITY})`
  } else {
    const bg = blend(MIDPOINT, ONE, (score - 0.5) / 0.5)
    scoreEl.style.backgroundColor = `rgba(${bg[0]}, ${bg[1]}, ${bg[2]}, ${OPACITY})`
  }

  return scoreEl
}

const getScore = async (doc: boolean) => {
  if (resolveLang() === 'UNKNOWN') return

  const res = await fetch(
    '/api/card/list?'
    + new URLSearchParams({
      path: doc ? editing : pwd,
      lang: resolveLang()
    }).toString()
  )

  // Error handling
  if (res.status !== 200) {
    const e = await res.text()
    console.error(e)
    alert(e)
  }

  // Read cards
  cards = await res.json()
  if (cards.length === 0) return 1
  else {
    let score = 0
    let total = 0
    for (const card of cards) {
      if (card.history?.score !== undefined) {
        const cardScore: number = card.history.score
        score += cardScore
        total++
      }
    }
    return total === 0 ? 1 : score / total
  }
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
  await getLimit()

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
  makeScore,
  getScore,
  openVFS,
  openEditor,
  openQueue,
  register,
  vfs,
  setTheme,
  loadTheme,
  toggleTheme
}
