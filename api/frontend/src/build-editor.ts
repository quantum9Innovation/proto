const deconstructEditor = () => {
  // Teardown editor layout
  const title = document.getElementById('title')
  const content = document.getElementById('content')
  const score = document.getElementById('editor-score')
  if (title !== null) title.remove()
  if (content !== null) content.remove()
  if (score !== null) score.remove()
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
    tagsEl.innerHTML += '<strong>Tags</strong>: '
    tagsEl.innerText += tags.join(', ')
    details.appendChild(tagsEl)
  }

  const notes: string | undefined = card.notes
  if (notes !== undefined) {
    const notesEl = document.createElement('p')
    notesEl.innerHTML += '<strong>Notes</strong>: '
    notesEl.innerText += notes
    details.appendChild(notesEl)
  }

  const grammar = card.grammar
  if (grammar !== undefined) {
    const pos: string | undefined = grammar.pos
    if (pos !== undefined) {
      const posEl = document.createElement('p')
      posEl.innerHTML += '<strong>Part of speech</strong>: '
      posEl.innerText += pos
      details.appendChild(posEl)
    }

    const context: string | undefined = grammar.context
    if (context !== undefined) {
      const contextEl = document.createElement('p')
      contextEl.innerHTML += '<strong>Context</strong>: '
      contextEl.innerText += context
      details.appendChild(contextEl)
    }

    const properties = grammar.properties
    if (properties !== undefined) {
      for (const prop in properties) {
        if (prop.includes('history')) delete properties[prop]
      }
      const propertiesEl = document.createElement('p')
      propertiesEl.innerHTML += '<strong>Grammar properties</strong>: '
      propertiesEl.innerText += JSON.stringify(properties, null, 2)
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

const autofillCard = (card: any, grammar: any) => {
  // Autofill card details into add card popup

  // Input fields
  const inputs = document.createElement('div')
  inputs.className = 'inputs'

  // Set arbitrary card values
  const autofillPart = (card: any, i: number) => {
    const term = document.getElementById(`input-term-${i}`) as HTMLInputElement
    term.value = card.term
    const definition = document.getElementById(`input-definition-${i}`) as HTMLInputElement
    definition.value = card.definition
    const tags = document.getElementById(`input-tags-${i}`) as HTMLInputElement
    tags.value = card.tags !== undefined ? card.tags.join(', ') : ''
    const notes = document.getElementById(`input-notes-${i}`) as HTMLInputElement
    notes.value = card.notes ?? ''
    const pos = document.getElementById(`input-pos-${i}`) as HTMLInputElement
    pos.value = card.grammar?.pos ?? ''
    const context = document.getElementById(`input-context-${i}`) as HTMLInputElement
    context.value = card.grammar?.context ?? ''

    const cardProps: Record<string, any> = card.grammar?.properties
    if (cardProps === undefined || cardProps.length === 0) return
    for (let j = 0; j < grammar.length; j++) {
      const property = grammar[j]
      const name: string = property.name
      const type: string = property.type

      const cardProp = cardProps[name]
      if (cardProp === undefined || cardProp === null) continue

      switch (type) {
        case 'string': {
          const input = document.getElementById(`input-property-${i}-${j}`) as HTMLInputElement
          input.value = cardProp
          break
        }
        case 'number': {
          const input = document.getElementById(`input-property-${i}-${j}`) as HTMLInputElement
          input.value = cardProp.toString()
          break
        }
        case 'boolean': {
          const input = document.getElementById(`input-property-${i}-${j}`) as HTMLInputElement
          input.checked = cardProp
          break
        }
        case 'Choice': {
          if (property.choices.multiple === true) {
            for (let k = 0; k < property.choices.options.length; k++) {
              const option = document.getElementById(
                `input-property-${i}-${j}-${k}`
              ) as HTMLInputElement
              const check = (cardProp as string[]).includes(property.choices.options[k])
              option.checked = check
            }
          } else {
            const input = document.getElementById(`input-property-${i}-${j}`) as HTMLInputElement
            input.value = cardProp
          }
          break
        }
        case 'GrammarCard': {
          const inputTerm = document.getElementById(
            `input-property-term-${i}-${j}`
          ) as HTMLInputElement
          inputTerm.value = cardProp.term
          const inputDefinition = document.getElementById(
            `input-property-definition-${i}-${j}`
          ) as HTMLInputElement
          inputDefinition.value = cardProp.definition
          break
        }
      }
    }
  }

  // Card
  autofillPart(card, 0)

  // Phrases
  const phrases = document.getElementById('editor-phrases-list') as HTMLDivElement
  const newPhrase = () => {
    const phrase = document.createElement('div')
    phrase.className = 'inputs'
    makeCardInputs(phrase, grammar, 1 + phrases.childElementCount)
    phrases.appendChild(phrase)
  }

  if (card.phrases === undefined || card.phrases.length === 0) return
  for (let i = 0; i < card.phrases.length; i++) {
    const phrase = card.phrases[i]
    newPhrase()
    autofillPart(phrase, i + 1)
  }
}

const putCards = (cards: any[]) => {
  const cardDisplay = document.getElementById('card-display')
  if (cardDisplay === null) return
  if (cards === undefined) return
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i]
    const term: string = card.term
    const definition: string = card.definition

    const cardItem = document.createElement('div')
    cardItem.className = 'card'
    const cardText = document.createElement('span')
    cardText.id = 'card-text'
    cardText.innerText = term + ': ' + definition
    cardText.addEventListener('click', e => { expandCard(card, cardItem) })
    const cardEdit = document.createElement('button')
    cardEdit.className = 'edit'
    cardEdit.innerText = 'Edit'
    cardEdit.addEventListener('click', e => {
      deleteCard(i)
        .then(async () => {
          const popup = document.getElementById('editor-popup')
          if (popup === null) return
          popup.className = 'popup show'
          const grammar = await getGrammar()
          autofillCard(card, grammar)
        })
        .catch(e => { console.error(e) })
    })
    const cardDel = document.createElement('button')
    cardDel.className = 'delete'
    cardDel.innerText = 'Delete'
    cardDel.addEventListener('click', e => {
      const del = confirm('Are you sure you want to delete this card (' + term + ')?')
      if (del) deleteCard(i).catch(e => { console.error(e) })
    })

    cardItem.appendChild(cardText)
    cardItem.appendChild(cardEdit)
    cardItem.appendChild(cardDel)
    cardDisplay.appendChild(cardItem)
  }
}

const makeCardInputs = (inputs: Element, grammar: any, i: number) => {
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

  if (grammar.length === 0) return
  const propertiesEl = document.createElement('div')
  propertiesEl.className = 'grammar'
  for (let j = 0; j < grammar.length; j++) {
    const property = grammar[j]
    const name: string = property.name
    const type: string = property.type
    switch (type) {
      case 'string': {
        const label = document.createElement('label')
        label.htmlFor = `input-property-${i}-${j}`
        label.innerText = name
        propertiesEl.appendChild(label)
        const input = document.createElement('input')
        input.id = `input-property-${i}-${j}`
        input.className = 'input-property-string'
        input.type = 'text'
        propertiesEl.appendChild(input)
        break
      }
      case 'number': {
        const label = document.createElement('label')
        label.htmlFor = `input-property-${i}-${j}`
        label.innerText = name
        propertiesEl.appendChild(label)
        const input = document.createElement('input')
        input.id = `input-property-${i}-${j}`
        input.className = 'input-property-number'
        input.type = 'number'
        propertiesEl.appendChild(input)
        break
      }
      case 'boolean': {
        const label = document.createElement('label')
        label.htmlFor = `input-property-${i}-${j}`
        label.innerText = name
        propertiesEl.appendChild(label)
        const input = document.createElement('input')
        input.id = `input-property-${i}-${j}`
        input.className = 'input-property-boolean'
        input.type = 'checkbox'
        propertiesEl.appendChild(input)
        const br = document.createElement('br')
        propertiesEl.appendChild(br)
        break
      }
      case 'Choice': {
        if (property.choices.multiple === true) {
          const label = document.createElement('label')
          label.htmlFor = `input-property-${i}-${j}`
          label.innerText = name
          const input = document.createElement('div')
          input.id = `input-property-${i}-${j}`
          input.className = 'input-property-multiple-choice'
          for (let k = 0; k < property.choices.options.length; k++) {
            const option = property.choices.options[k]
            const label = document.createElement('label')
            label.className = 'input-property-option'
            label.htmlFor = `input-property-${i}-${j}-${k}`
            label.innerText = option
            const optionEl = document.createElement('input')
            optionEl.id = `input-property-${i}-${j}-${k}`
            optionEl.type = 'checkbox'
            const br = document.createElement('br')
            input.appendChild(optionEl)
            input.appendChild(label)
            input.appendChild(br)
          }
          propertiesEl.appendChild(label)
          propertiesEl.appendChild(input)
        } else {
          const label = document.createElement('label')
          label.htmlFor = `input-property-${i}-${j}`
          label.innerText = name
          propertiesEl.appendChild(label)
          const input = document.createElement('select')
          input.id = `input-property-${i}-${j}`
          input.className = 'input-property-choice'
          /* option to not select anything */
          const optionEl = document.createElement('option')
          optionEl.value = 'deselected'
          optionEl.innerText = 'Not selected'
          input.appendChild(optionEl)
          for (const option of property.choices.options) {
            const optionEl = document.createElement('option')
            optionEl.value = option
            optionEl.innerText = option
            input.appendChild(optionEl)
          }
          propertiesEl.appendChild(input)
        }
        break
      }
      case 'GrammarCard': {
        const labelTerm = document.createElement('label')
        labelTerm.htmlFor = `input-property-term-${i}-${j}`
        labelTerm.innerText = name + ' (term)'
        propertiesEl.appendChild(labelTerm)
        const inputTerm = document.createElement('input')
        inputTerm.id = `input-property-term-${i}-${j}`
        inputTerm.className = 'input-property-term'
        inputTerm.type = 'text'
        propertiesEl.appendChild(inputTerm)
        const labelDefinition = document.createElement('label')
        labelDefinition.htmlFor = `input-property-definition-${i}-${j}`
        labelDefinition.innerText = name + ' (definition)'
        propertiesEl.appendChild(labelDefinition)
        const inputDefinition = document.createElement('input')
        inputDefinition.id = `input-property-definition-${i}-${j}`
        inputDefinition.className = 'input-property-definition'
        inputDefinition.type = 'text'
        propertiesEl.appendChild(inputDefinition)
        break
      }
    }
  }
  inputs.appendChild(propertiesEl)
}

const resetCardInputs = () => {
  // Reset all input fields and hide new card popup
  const inputs = document.getElementsByTagName('input')
  for (const input of inputs) {
    input.value = ''
    input.checked = false
  }
  const phrases = document.querySelectorAll('#editor-phrases-list .inputs')
  for (const phrase of phrases) phrase.remove()
  const popup = document.getElementById('editor-popup')
  if (popup !== null) popup.className = 'popup hide'
}

const getCardJSON = (grammar: any) => {
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

  const propertiesGetter = (i: number) => {
    for (let j = 0; j < grammar.length; j++) {
      const property = grammar[j]
      const name: string = property.name
      const type: string = property.type
      let value

      switch (type) {
        case 'string': {
          // text input
          const el: HTMLInputElement | null = (
            document.getElementById(`input-property-${i}-${j}`) as HTMLInputElement
          )
          const valueStatus = !(el.value === undefined || el.value === '')
          if (el === null) continue
          if (!valueStatus) break
          value = el.value
          break
        }
        case 'number': {
          // numerical input
          const el: HTMLInputElement | null = (
            document.getElementById(`input-property-${i}-${j}`) as HTMLInputElement
          )
          const valueStatus = !(el.value === undefined || el.value === '')
          if (el === null) continue
          if (!valueStatus) break
          value = el.valueAsNumber
          break
        }
        case 'boolean': {
          // checkbox input
          const el: HTMLInputElement | null = (
            document.getElementById(`input-property-${i}-${j}`) as HTMLInputElement
          )
          if (el === null) continue
          value = el.checked ? true : undefined
          break
        }
        case 'Choice': {
          if (property.choices.multiple === true) {
            // multiple checkbox input
            value = []
            for (let k = 0; k < property.choices.options.length; k++) {
              const option = property.choices.options[k]
              const el: HTMLInputElement | null = (
                document.getElementById(`input-property-${i}-${j}-${k}`) as HTMLInputElement
              )
              if (el === null) continue
              if (el.checked) value.push(option)
            }
            if (value.length === 0) value = undefined
          } else {
            // select box
            const el: HTMLInputElement | null = (
              document.getElementById(`input-property-${i}-${j}`) as HTMLInputElement
            )
            const valueStatus = !(
              el.value === undefined
              || el.value === ''
              || el.value === 'deselected'
            )
            if (el === null) continue
            if (!valueStatus) break
            value = el.value
          }
          break
        }
        case 'GrammarCard': {
          // both term and definition are text inputs
          const termEl: HTMLInputElement | null = (
            document.getElementById(`input-property-term-${i}-${j}`) as HTMLInputElement
          )
          const definitionEl: HTMLInputElement | null = (
            document.getElementById(`input-property-definition-${i}-${j}`) as HTMLInputElement
          )
          if (termEl === null) continue
          if (definitionEl === null) continue
          const valueStatus = !(
            termEl.value === undefined || termEl.value === ''
            || definitionEl.value === undefined || definitionEl.value === ''
          )
          if (!valueStatus) break
          value = { term: termEl.value, definition: definitionEl.value }
          break
        }
      }

      if (value !== undefined) {
        if (i === 0) cardJSON.grammar.properties[name] = value
        else cardJSON.phrases[i - 1].grammar.properties[name] = value
      } else if (property.default !== undefined) {
        if (i === 0) cardJSON.grammar.properties[name] = property.default
        else cardJSON.phrases[i - 1].grammar.properties[name] = property.default
      }
    }
  }

  getter('term', 0)
  getter('definition', 0)
  getter('tags', 0)
  getter('notes', 0)

  cardJSON.grammar = {}
  grammarGetter('pos', 0)
  grammarGetter('context', 0)

  if (grammar.length > 0) {
    cardJSON.grammar.properties = {}
    propertiesGetter(0)
  }

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

    if (grammar.length > 0) {
      cardJSON.phrases[i - 1].grammar.properties = {}
      propertiesGetter(i)
    }
  }

  return cardJSON
}

const newCard = (grammar: any, create: boolean) => {
  // Popup for creating a new card
  let popup: HTMLDivElement
  if (create) {
    popup = document.createElement('div')
    popup.id = 'editor-popup'
    popup.className = 'popup hide'
    document.body.appendChild(popup)
  } else {
    popup = document.getElementById('editor-popup') as HTMLDivElement
    popup.innerHTML = ''
  }

  // Input fields
  const inputs = document.createElement('div')
  inputs.className = 'inputs'
  makeCardInputs(inputs, grammar, 0)
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
    makeCardInputs(phrase, grammar, 1 + phrases.childElementCount)
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
    addCard(getCardJSON(grammar)).catch(e => { console.error(e) })
  })
  popup.appendChild(cancelBtn)
  popup.appendChild(submitBtn)

  return popup
}

const makeEditorRibbon = () => {
  const ribbon = document.createElement('div')
  ribbon.className = 'row'

  const cancelBtn = document.createElement('button')
  cancelBtn.id = 'editor-close'
  cancelBtn.innerText = 'Back'

  const startQueueBtn = document.createElement('button')
  startQueueBtn.id = 'start-queue'
  startQueueBtn.innerText = 'Start Queue'

  const submitBtn = document.createElement('button')
  submitBtn.id = 'editor-submit'
  submitBtn.className = 'submit'
  submitBtn.innerText = 'Add'

  // Add event listeners
  cancelBtn.addEventListener('click', e => { openVFS() })
  startQueueBtn.addEventListener('click', e => {
    openQueue(true).catch(e => { console.error(e) })
  })
  submitBtn.addEventListener('click', e => {
    const popup = document.getElementById('editor-popup')
    if (popup === null) return
    popup.className = 'popup show'
  })

  ribbon.appendChild(cancelBtn)
  ribbon.appendChild(startQueueBtn)
  ribbon.appendChild(submitBtn)
  return ribbon
}

const buildEditor = (doc: string, grammar: any) => {
  // Build content for document editor
  let content = document.getElementById('content')
  if (content === null) {
    makeEditorContent()
    content = document.getElementById('content')
  }

  // Append navigation ribbon
  const ribbon = makeEditorRibbon()
  content!.appendChild(ribbon)

  // Make popups
  const popup = newCard(grammar, true)
  content!.appendChild(popup)

  // Read cards
  const cardDisplay = document.createElement('div')
  cardDisplay.id = 'card-display'
  content!.appendChild(cardDisplay)
  readCards(doc)
    .then(cards => { putCards(cards) })
    .catch(e => { console.error(e) })

  // Show score
  getScore(true).then(score => {
    if (score === undefined) return
    const scoreEl = makeScore(score)
    scoreEl.id = 'editor-score'
    document.body.appendChild(scoreEl)
  }).catch(e => { console.error(e) })
}

const showCards = (doc: string, grammar: any) => {
  newCard(grammar, false)
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
