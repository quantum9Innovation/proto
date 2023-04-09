const deconstructEditor = () => {
  // Teardown editor layout
  const title = document.getElementById('title')
  const content = document.getElementById('content')
  if (title !== null) title.remove()
  if (content !== null) content.remove()
}

const setEditorTitle = (title: string) => {
  // Change title
  if (document.getElementById('title') !== undefined) {
    const titleEl = document.createElement('h1')
    titleEl.id = 'title'
    titleEl.innerText = title
    document.body.appendChild(titleEl)
  } else (document.getElementById('title') as HTMLHeadingElement).innerText = title
}

const makeEditorContent = () => {
  // Build content
  const content = document.createElement('div')
  content.id = 'content'
  document.body.appendChild(content)
}

const readCards = async (name: string) => {
  // Read file data and return array of cards
  const res = await fetch('/api/vfs/serve?' + new URLSearchParams({ path: name }).toString())
  const file = await res.json()
  return file.cards
}

const addCardDetails = (card: any, details: Element, phrase: boolean) => {
  // Add details to card
  if (phrase) {
    const term: string = card.term
    const definition: string = card.definition
    const phraseEl = document.createElement('p')
    phraseEl.className = 'phrase-header'
    phraseEl.innerText = term + ': ' + definition
    details.appendChild(phraseEl)
  }

  const tags: string[] | undefined = card.tags
  if (tags !== undefined) {
    const tagsEl = document.createElement('p')
    tagsEl.innerHTML = '<strong>Tags</strong>: ' + tags.join(', ')
    details.appendChild(tagsEl)
  }

  const notes: string | undefined = card.notes
  if (notes !== undefined) {
    const notesEl = document.createElement('p')
    notesEl.innerHTML = '<strong>Notes</strong>: ' + notes
    details.appendChild(notesEl)
  }

  const grammar = card.grammar
  if (grammar !== undefined) {
    const pos: string | undefined = grammar.pos
    if (pos !== undefined) {
      const posEl = document.createElement('p')
      posEl.innerHTML = '<strong>Part of speech</strong>: ' + pos
      details.appendChild(posEl)
    }

    const context: string | undefined = grammar.context
    if (context !== undefined) {
      const contextEl = document.createElement('p')
      contextEl.innerHTML = '<strong>Context</strong>: ' + context
      details.appendChild(contextEl)
    }

    const properties = grammar.properties
    if (properties !== undefined) {
      const propertiesEl = document.createElement('p')
      propertiesEl.innerHTML = '<strong>Grammar properties</strong>: '
                               + JSON.stringify(properties, null, 2)
      details.appendChild(propertiesEl)
    }
  }

  if (!phrase) {
    const phrases: any[] = card.phrases
    if (phrases === undefined) return
    const phrasesEl = document.createElement('div')
    phrasesEl.className = 'phrases'
    phrases.forEach(phrase => {
      const phraseEl = document.createElement('div')
      phraseEl.className = 'phrase'
      addCardDetails(phrase, phraseEl, true)
      phrasesEl.appendChild(phraseEl)
    })
    details.appendChild(phrasesEl)
  }
}

const expandCard = (card: any, cardItem: HTMLDivElement) => {
  // Expand card to show details or collapse if already expanded
  if (cardItem.classList.contains('expanded')) {
    // Collapse
    cardItem.classList.remove('expanded')
    const details = cardItem.getElementsByClassName('details')[0]
    if (details !== undefined) details.classList.add('hide')
    return
  }

  cardItem.classList.add('expanded')
  let details = cardItem.getElementsByClassName('details')[0]
  if (details !== undefined) {
    // Show details if already present
    details.classList.remove('hide')
    details.classList.add('show')
    return
  }

  details = document.createElement('div')
  details.className = 'details show'
  addCardDetails(card, details, false)
  cardItem.appendChild(details)
}

const putCards = (cards: any[]) => {
  const cardDisplay = document.getElementById('card-display')
  if (cardDisplay === null) return
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i]
    const term: string = card.term
    const definition: string = card.definition

    const cardItem = document.createElement('div')
    cardItem.className = 'card'
    const cardText = document.createElement('span')
    cardText.innerText = term + ': ' + definition
    const cardInfo = document.createElement('button')
    cardInfo.className = 'edit'
    cardInfo.innerText = 'Info'
    cardInfo.addEventListener('click', e => { expandCard(card, cardItem) })
    const cardDel = document.createElement('button')
    cardDel.className = 'delete'
    cardDel.innerText = 'Delete'
    cardDel.addEventListener('click', e => {
      deleteCard(i).catch(e => { console.error(e) })
    })

    cardItem.appendChild(cardText)
    cardItem.appendChild(cardInfo)
    cardItem.appendChild(cardDel)
    cardDisplay.appendChild(cardItem)
  }
}

const makeRibbon = () => {
  const ribbon = document.createElement('div')
  ribbon.className = 'row'

  const cancelBtn = document.createElement('button')
  cancelBtn.id = 'editor-close'
  cancelBtn.innerText = 'Back'

  const submitBtn = document.createElement('button')
  submitBtn.id = 'editor-submit'
  submitBtn.className = 'submit'
  submitBtn.innerText = 'Add'

  // Add event listeners
  cancelBtn.addEventListener('click', e => { openVFS() })
  submitBtn.addEventListener('click', e => { /* TODO: add new cards */ })

  ribbon.appendChild(cancelBtn)
  ribbon.appendChild(submitBtn)
  return ribbon
}

const buildEditor = (doc: string) => {
  // Build content for document editor
  let content = document.getElementById('content')
  if (content === null) {
    makeEditorContent()
    content = document.getElementById('content')
  }

  // Append create button
  const container = document.createElement('div')
  container.className = 'row'
  const createButton = document.createElement('button')
  createButton.id = 'editor-create'
  createButton.className = 'create'
  createButton.innerText = 'Create'
  container.appendChild(createButton)
  content!.appendChild(container)

  // Read cards
  const cardDisplay = document.createElement('div')
  cardDisplay.id = 'card-display'
  content!.appendChild(cardDisplay)
  readCards(doc)
    .then(cards => { putCards(cards) })
    .catch(e => { console.error(e) })

  // Append navigation ribbon
  const ribbon = makeRibbon()
  content!.appendChild(ribbon)
}

const showCards = (doc: string) => {
  const cardDisplay = document.getElementById('card-display')
  if (cardDisplay !== null) cardDisplay.innerHTML = ''
  readCards(doc)
    .then(cards => { putCards(cards) })
    .catch(e => { console.error(e) })
}

window.exports = {
  deconstructEditor,
  setEditorTitle,
  makeEditorContent,
  buildEditor,
  showCards
}
