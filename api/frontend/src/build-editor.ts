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

const makeCardInputs = (inputs: Element, i: number) => {
  // TODO: deal with grammatical properties

  // Input fields
  const termLabel = document.createElement('label')
  termLabel.htmlFor = `input-term-${i}`
  termLabel.innerText = 'Term'
  const term = document.createElement('input')
  term.id = `input-term-${i}`
  term.className = 'input-term'
  inputs.appendChild(termLabel)
  inputs.appendChild(term)

  const definitionLabel = document.createElement('label')
  definitionLabel.htmlFor = `input-definition-${i}`
  definitionLabel.innerText = 'Definition'
  const definition = document.createElement('input')
  definition.id = `input-definition-${i}`
  definition.className = 'input-definition'
  inputs.appendChild(definitionLabel)
  inputs.appendChild(definition)

  const tagsLabel = document.createElement('label')
  tagsLabel.htmlFor = `input-tags-${i}`
  tagsLabel.innerText = 'Tags'
  const tags = document.createElement('input')
  tags.id = `input-tags-${i}`
  tags.className = 'input-tags'
  inputs.appendChild(tagsLabel)
  inputs.appendChild(tags)

  const notesLabel = document.createElement('label')
  notesLabel.htmlFor = `input-notes-${i}`
  notesLabel.innerText = 'Notes'
  const notes = document.createElement('input')
  notes.id = `input-notes-${i}`
  notes.className = 'input-notes'
  inputs.appendChild(notesLabel)
  inputs.appendChild(notes)

  const posLabel = document.createElement('label')
  posLabel.htmlFor = `input-pos-${i}`
  posLabel.innerText = 'Part of speech'
  const pos = document.createElement('input')
  pos.id = `input-pos-${i}`
  pos.className = 'input-pos'
  inputs.appendChild(posLabel)
  inputs.appendChild(pos)

  const contextLabel = document.createElement('label')
  contextLabel.htmlFor = `input-context-${i}`
  contextLabel.innerText = 'Context'
  const context = document.createElement('input')
  context.id = `input-context-${i}`
  context.className = 'input-context'
  inputs.appendChild(contextLabel)
  inputs.appendChild(context)
}

const resetCardInputs = () => {
  // Reset all input fields and hide new card popup
  const inputs = document.getElementsByTagName('input')
  for (const input of inputs) input.value = ''
  const phrases = document.querySelectorAll('#editor-phrases-list .inputs')
  for (const phrase of phrases) phrase.remove()
  const popup = document.getElementById('editor-popup')
  if (popup !== null) popup.className = 'popup hide'
}

const getCardJSON = () => {
  // Pipe card popup to JSON object
  const cardJSON: any = {}

  const getter = (name: string, i: number) => {
    const el: any = document.getElementById(`input-${name}-${i}`)
    let value = el.value
    if (name === 'tags') {
      value = value.split(',')
      for (let i = 0; i < value.length; i++) {
        const trimmed = value[i].trim()
        if (trimmed !== '') value[i] = trimmed
        else value.splice(i, 1)
      }
    }
    const elStatus = !(el === undefined && el === null)
    const valueStatus = !(value === undefined || value === '' || value.length === 0)
    if (elStatus && valueStatus) {
      if (i === 0) cardJSON[name] = value
      else cardJSON.phrases[i - 1][name] = value
    }
  }

  const grammarGetter = (name: string, i: number) => {
    const el: any = document.getElementById(`input-${name}-${i}`)
    const value = el.value
    const elStatus = !(el === undefined && el === null)
    const valueStatus = !(value === undefined || value === '' || value.length === 0)
    if (elStatus && valueStatus) {
      if (i === 0) cardJSON.grammar[name] = value
      else cardJSON.phrases[i - 1].grammar[name] = value
    }
  }

  getter('term', 0)
  getter('definition', 0)
  getter('tags', 0)
  getter('notes', 0)

  cardJSON.grammar = {}
  grammarGetter('pos', 0)
  grammarGetter('context', 0)

  const phrases = document.getElementById('editor-phrases-list')
  if (phrases === null || phrases.children.length === 0) return cardJSON
  cardJSON.phrases = []
  for (let i = 1; i <= phrases.children.length; i++) {
    cardJSON.phrases.push({})

    getter('term', i)
    getter('definition', i)
    getter('tags', i)
    getter('notes', i)

    cardJSON.phrases[i - 1].grammar = {}
    grammarGetter('pos', i)
    grammarGetter('context', i)
  }

  return cardJSON
}

const newCard = () => {
  // Popup for creating a new card
  const popup = document.createElement('div')
  popup.id = 'editor-popup'
  popup.className = 'popup hide'
  document.body.appendChild(popup)

  // Input fields
  const inputs = document.createElement('div')
  inputs.className = 'inputs'
  makeCardInputs(inputs, 0)
  popup.appendChild(inputs)

  // Phrases
  const phrases = document.createElement('div')
  phrases.id = 'editor-phrases-list'
  phrases.className = 'inputs-phrases'
  const phraseBtns = document.createElement('div')
  phraseBtns.className = 'row'
  const newPhraseBtn = document.createElement('button')
  newPhraseBtn.id = 'editor-new-phrase'
  newPhraseBtn.className = 'submit'
  newPhraseBtn.innerText = 'New phrase'
  newPhraseBtn.addEventListener('click', e => {
    const phrase = document.createElement('div')
    phrase.className = 'inputs'
    makeCardInputs(phrase, 1 + phrases.childElementCount)
    phrases.appendChild(phrase)
  })
  const removePhraseBtn = document.createElement('button')
  removePhraseBtn.id = 'editor-remove-phrase'
  removePhraseBtn.className = 'close'
  removePhraseBtn.innerText = 'Delete last'
  removePhraseBtn.addEventListener('click', e => {
    const phrase = phrases.lastElementChild
    if (!(phrase === undefined || phrase === null)) {
      phrases.removeChild(phrase)
    }
  })
  popup.appendChild(phrases)
  phraseBtns.appendChild(removePhraseBtn)
  phraseBtns.appendChild(newPhraseBtn)
  popup.appendChild(phraseBtns)

  // Navigation
  const cancelBtn = document.createElement('button')
  cancelBtn.id = 'editor-close-popup'
  cancelBtn.innerText = 'Cancel'
  cancelBtn.addEventListener('click', e => { popup.className = 'popup hide' })
  const submitBtn = document.createElement('button')
  submitBtn.id = 'editor-submit-popup'
  submitBtn.className = 'submit'
  submitBtn.innerText = 'Finish'
  submitBtn.addEventListener('click', e => {
    addCard(getCardJSON()).catch(e => { console.error(e) })
  })
  popup.appendChild(cancelBtn)
  popup.appendChild(submitBtn)

  return popup
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
  submitBtn.addEventListener('click', e => {
    const popup = document.getElementById('editor-popup')
    if (popup === null) return
    popup.className = 'popup show'
  })

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

  // Append navigation ribbon
  const ribbon = makeRibbon()
  content!.appendChild(ribbon)

  // Make popups
  const popup = newCard()
  content!.appendChild(popup)

  // Read cards
  const cardDisplay = document.createElement('div')
  cardDisplay.id = 'card-display'
  content!.appendChild(cardDisplay)
  readCards(doc)
    .then(cards => { putCards(cards) })
    .catch(e => { console.error(e) })
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
  resetCardInputs,
  buildEditor,
  showCards
}
