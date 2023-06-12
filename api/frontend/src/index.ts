// Globals
let scene = 'init'
let pwd = '/'
let editing = ''
let cards: any[] = []
let noCorrect = 0
let progress: number = 0
let configCache: any
let limit: number
let ping: number

// Ambient context
declare let Cookies: any

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

const alertPing = () => { alert(`Ping is ${ping}ms`) }
const forgetPIN = () => {
  Cookies.remove('pin')
  alert('PIN successfully reset.')
}
const konami = () => {
  const clamp = (c: number[]) => [
    Math.max(0, Math.min(255, c[0])),
    Math.max(0, Math.min(255, c[1])),
    Math.max(0, Math.min(255, c[2]))
  ]
  const norm = (c: number[]) => [
    c[0] * 0.75 + 255 * 0.125,
    c[1] * 0.75 + 255 * 0.125,
    c[2] * 0.75 + 255 * 0.125
  ]
  const randomize = (c: number[]) => clamp([
    c[0] + 255 * 2 * (Math.random() - 1 / 2) / 4,
    c[0] + 255 * 2 * (Math.random() - 1 / 2) / 4,
    c[0] + 255 * 2 * (Math.random() - 1 / 2) / 4
  ])
  const random = () => [
    255 * Math.random(),
    255 * Math.random(),
    255 * Math.random()
  ]
  const C1 = norm(random())
  const C2 = randomize(C1)
  const C3 = norm(random())
  const C4 = randomize(C3)
  const C5 = norm(random())
  const C6 = randomize(C5)

  const blend = (c1: number[], c2: number[], p: number) => [
    c1[0] * (1 - p) + c2[0] * p,
    c1[1] * (1 - p) + c2[1] * p,
    c1[2] * (1 - p) + c2[2] * p
  ]
  const saturate = (c: number[], factor: number) => {
    const [r, g, b] = c
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const k = 255 * factor / (max - min)
    return [
      k * (r - min),
      k * (g - min),
      k * (b - min)
    ]
  }
  const cDocument = saturate(blend(C1, C2, 0.25), 0.75)
  const cDocumentText = saturate(blend(C1, C2, 0.75), 0.75)
  const cCorrect = saturate(blend(C3, C4, 0), 0.75)
  const cSubmit = saturate(blend(C3, C4, 0.25), 0.75)
  const cFolder = saturate(blend(C3, C4, 0.5), 0.75)
  const cProgressBeginning = saturate(blend(C3, C4, 0.75), 0.75)
  const cFolderText = saturate(blend(C3, C4, 1), 0.75)
  const cIncorrect = saturate(blend(C5, C6, 0.25), 0.75)
  const cClose = saturate(blend(C5, C6, 0.75), 0.75)

  const content = document.getElementById('content')
  if (content === null || content === undefined) return

  content.style.setProperty(
    '--document', `rgb(${cDocument[0]}, ${cDocument[1]}, ${cDocument[2]})`
  )
  content.style.setProperty(
    '--document-text', `rgb(${cDocumentText[0]}, ${cDocumentText[1]}, ${cDocumentText[2]})`
  )
  content.style.setProperty(
    '--correct', `rgba(${cCorrect[0]}, ${cCorrect[1]}, ${cCorrect[2]}, 0.3125)`
  )
  content.style.setProperty(
    '--submit', `rgb(${cSubmit[0]}, ${cSubmit[1]}, ${cSubmit[2]})`
  )
  content.style.setProperty(
    '--progress-end', `rgb(${cSubmit[0]}, ${cSubmit[1]}, ${cSubmit[2]})`
  )
  content.style.setProperty(
    '--folder', `rgb(${cFolder[0]}, ${cFolder[1]}, ${cFolder[2]})`
  )
  content.style.setProperty(
    '--progress-beginning',
    `rgb(${cProgressBeginning[0]}, ${cProgressBeginning[1]}, ${cProgressBeginning[2]})`
  )
  content.style.setProperty(
    '--folder-text', `rgb(${cFolderText[0]}, ${cFolderText[1]}, ${cFolderText[2]})`
  )
  content.style.setProperty(
    '--incorrect', `rgba(${cIncorrect[0]}, ${cIncorrect[1]}, ${cIncorrect[2]}, 0.3125)`
  )
  content.style.setProperty(
    '--close', `rgb(${cClose[0]}, ${cClose[1]}, ${cClose[2]})`
  )

  alert('Konami code activated!')
}
const register = async () => {
  // Register fonts
  const notoSans = new FontFace('Noto Sans', 'url(frontend/assets/noto-universal.ttf)')
  document.fonts.add(notoSans)

  const sent = Date.now()
  const res = await fetch('/api/init/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ timestamp: sent })
  })
  if (res.status !== 200) {
    if (res.status === 403) {
      // Get PIN code from user
      const PIN = prompt('Enter PIN code:')
      if (PIN === null) {
        alert('Reload to try again.')
        return
      }
      Cookies.set('pin', PIN)
      register()
      vfs()
      return
    }

    const e = await res.text()
    console.error('Failed to establish connection!\nReload to try again.')
    console.error(e)
    alert(e)
  }
  ping = Date.now() - sent

  const pingRes = await fetch('/api/init/ping', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ping })
  })
  if (pingRes.status !== 200) {
    const e = await pingRes.text()
    console.error('Ping request failed.')
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
  configCache = config
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
  showCards(editing, configCache)
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
  showCards(editing, configCache)
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
  scoreEl.innerText = score === 0 ? '0' : (100 * score).toPrecision(3)

  // Colors
  const ZERO = [156, 47, 47] // #9c2f2f
  const MIDPOINT = [198, 168, 9] // #c6a809
  const ONE = [8, 154, 6] // #089a06
  const blend = (c1: number[], c2: number[], p: number) => [
    c1[0] * (1 - p) + c2[0] * p,
    c1[1] * (1 - p) + c2[1] * p,
    c1[2] * (1 - p) + c2[2] * p
  ]
  if (score < 0.5) {
    const bg = blend(ZERO, MIDPOINT, score / 0.5)
    scoreEl.style.backgroundColor = `rgb(${bg[0]}, ${bg[1]}, ${bg[2]})`
  } else {
    const bg = blend(MIDPOINT, ONE, (score - 0.5) / 0.5)
    scoreEl.style.backgroundColor = `rgb(${bg[0]}, ${bg[1]}, ${bg[2]})`
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
    if (e === 'Document contains no cards.') return 0
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
  alertPing,
  forgetPIN,
  konami,
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
