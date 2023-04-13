const deconstructQueue = () => {
  // Teardown queue layout
  const title = document.getElementById('title')
  const content = document.getElementById('content')
  if (title !== null) title.remove()
  if (content !== null) content.remove()
}

const setQueueTitle = (title: string) => {
  // Change title
  if (document.getElementById('title') !== undefined) {
    const titleEl = document.createElement('h1')
    titleEl.id = 'title'
    titleEl.innerText = title
    document.body.appendChild(titleEl)
  } else (document.getElementById('title') as HTMLHeadingElement).innerText = title
}

const makeQueueContent = () => {
  // Build content
  const content = document.createElement('div')
  content.id = 'content'
  document.body.appendChild(content)
}

const updateProgressBar = (progress: number) => {
  // Update progress bar
  const progressBar = document.getElementById('progress-bar')
  if (progressBar === null || progressBar === undefined) return
  progressBar.style.width = `${progress * 100}%`
}

const addProp = (prefill?: string) => {
  const propsList = document.getElementById('queue-props-list')
  if (propsList === null) return
  const inputEl = document.createElement('input')
  inputEl.className = 'inputs'
  if (prefill !== undefined) inputEl.value = prefill
  propsList.appendChild(inputEl)
}

const putProps = () => {
  const props = document.createElement('div')
  props.id = 'queue-props'
  const propsList = document.createElement('div')
  propsList.id = 'queue-props-list'
  props.appendChild(propsList)

  const addBtn = document.createElement('button')
  addBtn.id = 'queue-props-add'
  addBtn.className = 'submit'
  addBtn.innerText = 'Add'

  const removeBtn = document.createElement('button')
  removeBtn.id = 'queue-props-remove'
  removeBtn.className = 'close'
  removeBtn.innerText = 'Remove'

  addBtn.addEventListener('click', e => { addProp() })
  removeBtn.addEventListener('click', e => {
    const input = propsList.lastChild
    if (!(input === undefined || input === null)) {
      propsList.removeChild(input)
    }
  })

  props.appendChild(addBtn)
  props.appendChild(removeBtn)

  return props
}

const newFlashcard = (card: any) => {
  // Build flashcard
  const flashcard = document.createElement('div')
  flashcard.id = 'flashcard'

  // Extract necessary card data
  const term = card.term

  // Build flashcard elements
  const termEl = document.createElement('h2')
  termEl.id = 'queue-term'
  termEl.innerText = term
  flashcard.appendChild(termEl)

  const definitionEl = document.createElement('input')
  definitionEl.id = 'queue-definition'
  flashcard.appendChild(definitionEl)

  // Return flashcard
  return flashcard
}

const makeQueueRibbon = (config: any) => {
  const ribbon = document.createElement('div')
  ribbon.id = 'queue-ribbon'
  ribbon.className = 'row'

  const closeBtn = document.createElement('button')
  closeBtn.id = 'editor-close'
  closeBtn.innerText = 'Close'

  const nextBtn = document.createElement('button')
  nextBtn.id = 'editor-submit'
  nextBtn.className = 'submit'
  nextBtn.innerText = 'Next'

  // Add event listeners
  closeBtn.addEventListener('click', e => { openVFS() })
  nextBtn.addEventListener('click', e => { /* TODO: queue review transition (use config) */ })

  ribbon.appendChild(closeBtn)
  ribbon.appendChild(nextBtn)
  return ribbon
}

const includesProperties = (card: any, config: any) => {
  if (card.grammar === undefined) return false
  if (card.grammar.properties === undefined) return false

  let reqMet = false
  const properties: Record<string, any> = card.grammar.properties

  for (const name in properties) {
    const prop: any = properties[name]
    if (prop === undefined) continue

    let propConfig: any
    for (const defProp of config) {
      if (name === defProp.name) {
        propConfig = defProp
        break
      }
    }

    const type: string = propConfig.type
    const test: boolean = propConfig.test
    const method: string = propConfig.method
    if (test && method !== 'separately') {
      if (type !== 'boolean') reqMet = true
      else if (prop !== false) reqMet = true
    }
  }
  return reqMet
}

const buildQueueCard = (card: any, config: any) => {
  // Build content for document editor
  let content = document.getElementById('content')
  if (content === null) {
    makeEditorContent()
    content = document.getElementById('content')
  }

  // Progress bar
  const progressBar = document.createElement('div')
  progressBar.id = 'progress-bar'
  content!.appendChild(progressBar)

  // Make flashcard
  const flashcard = newFlashcard(card)
  content!.appendChild(flashcard)

  // Grammar property input fields
  const grammarStatus = includesProperties(card, config)
  if (grammarStatus) {
    const grammarProps = putProps()
    content!.appendChild(grammarProps)
  }
  // TODO: prefill hints
  // TODO: refresh content display func between card/review transition

  // Append navigation ribbon
  const ribbon = makeQueueRibbon(config)
  content!.appendChild(ribbon)
}

const buildQueueReview = (correct: boolean, card: any, received: string, stats: number[]) => {
  // // Build content for document editor
  // let content = document.getElementById('content')
  // if (content === null) {
  //   makeEditorContent()
  //   content = document.getElementById('content')
  // }

  // // Append navigation ribbon
  // const ribbon = makeRibbon()
  // content!.appendChild(ribbon)

  // // Make popups
  // const popup = newCard(grammar)
  // content!.appendChild(popup)

  // // Read cards
  // const cardDisplay = document.createElement('div')
  // cardDisplay.id = 'card-display'
  // content!.appendChild(cardDisplay)
  // readCards(doc)
  //   .then(cards => { putCards(cards) })
  //   .catch(e => { console.error(e) })
}

window.exports = {
  deconstructQueue,
  setQueueTitle,
  makeQueueContent,
  updateProgressBar,
  buildQueueCard,
  buildQueueReview
}
