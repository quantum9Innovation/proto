const deconstructQueue = () => {
  // Teardown queue layout
  const title = document.getElementById('title')
  const content = document.getElementById('content')
  if (title !== null) title.remove()
  if (content !== null) content.remove()
}

const refreshQueue = () => {
  // Refresh queue content only
  const content = document.getElementById('content')
  if (content !== null) content.innerHTML = ''
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

  // Check for grammar card
  let grammar = false
  if (card.definition.term !== undefined) grammar = true

  // Extract necessary card data
  const term: string = grammar ? `${card.term as string} / ${card.definition.term as string}` : card.term
  const pos: string = grammar ? undefined : card.grammar?.pos
  const context: string = grammar ? undefined : card.grammar?.context

  // Build flashcard elements
  if (pos !== undefined) {
    const posEl = document.createElement('p')
    posEl.id = 'queue-pos'
    posEl.innerText = pos
    flashcard.appendChild(posEl)
  }

  const termEl = document.createElement('h2')
  termEl.id = 'queue-term'
  termEl.innerText = context !== undefined ? `${term} (${context})` : term
  flashcard.appendChild(termEl)

  const definitionEl = document.createElement('input')
  definitionEl.id = 'queue-definition'
  flashcard.appendChild(definitionEl)

  // Return flashcard
  return flashcard
}

const newReviewCard = (correct: boolean, card: any, received: string, stats: number[]) => {
  // Build review card
  const reviewCard = document.createElement('div')
  reviewCard.id = 'review-card'
  if (correct) reviewCard.className = 'correct'
  else reviewCard.className = 'incorrect'

  // Build main review card elements
  const main = document.createElement('div')
  main.id = 'review-card-main'

  // Check for grammar card
  let grammar = false
  if (card.definition.term !== undefined) grammar = true

  const truth = document.createElement('h2')
  const term: string = grammar ? card.definition.term : card.term
  const definition: any = grammar ? card.definition.definition : card.definition
  let definitionStr: string
  if (typeof definition === 'string') definitionStr = definition
  else if (typeof definition === 'number') definitionStr = definition.toString()
  else if (Array.isArray(definition)) definitionStr = definition.join(' ')
  else definitionStr = JSON.stringify(definition)
  truth.id = 'queue-review-truth'
  truth.innerText = term + ' / ' + definitionStr

  const rawTruth = document.createElement('pre')
  const miniCard = JSON.parse(JSON.stringify(card)) // deep copy
  if (miniCard.history !== undefined) delete miniCard.history
  if (miniCard.score !== undefined) delete miniCard.score
  if (miniCard.id !== undefined) delete miniCard.id
  if (miniCard.grammar?.properties !== undefined) {
    for (const prop in miniCard.grammar.properties) {
      if (prop.includes('history')) delete miniCard.grammar.properties[prop]
    }
  }
  if (miniCard.phrases !== undefined) delete miniCard.phrases
  rawTruth.id = 'queue-review-raw-truth'
  rawTruth.innerText = JSON.stringify(miniCard)

  const rec = document.createElement('pre')
  rec.id = 'queue-review-received'
  rec.innerText = received

  main.appendChild(truth)
  main.appendChild(rawTruth)
  main.appendChild(rec)
  reviewCard.appendChild(main)

  // Build stats
  const reviewStats = document.createElement('div')
  reviewStats.id = 'queue-review-stats'
  reviewStats.className = 'scores'
  const cardOldScore = stats[0]
  const overallScore = stats[stats.length - 1]

  const oldScoreEl = makeScore(cardOldScore)
  oldScoreEl.id = 'queue-review-old-score'
  const overallScoreEl = makeScore(overallScore)
  overallScoreEl.id = 'queue-review-overall-score'

  reviewStats.appendChild(oldScoreEl)
  reviewStats.appendChild(overallScoreEl)
  reviewCard.appendChild(reviewStats)

  return reviewCard
}

const toQueueReview = (card: any, config: any) => {
  const definitionEl = (document.getElementById('queue-definition') as HTMLInputElement)
  const propsList = (document.getElementById('queue-props-list') as HTMLDivElement)

  let correct = true
  const recGrammar: any = {}

  const matches = (expected: string, received: string) =>
    (expected.toLowerCase().trim() === received.toLowerCase().trim())

  let definitionReceived = definitionEl.value
  if (card.grammar?.properties !== undefined) {
    const props = card.grammar.properties

    // Compile received grammatical properties
    const grammarInputs: Record<string, string> = {}
    if (
      !(propsList === undefined || propsList === null)
      && !(
        propsList.children === undefined
        || propsList.children === null
        || propsList.children.length === 0
      )
    ) {
      for (const prop of propsList.children) {
        if ('value' in prop) {
          const value = prop.value as string
          const tokenized = value.split(' ')
          if (tokenized.length < 2) {
            // Assume boolean property
            tokenized.push('')
          }
          const name = tokenized[0]
          const definition = tokenized.slice(1).join(' ')
          grammarInputs[name] = definition
        }
      }
    }

    // Check for required grammatical properties
    for (const name in props) {
      const prop: any = props[name]
      if (prop === undefined) continue

      let propConfig: any
      for (const defProp of config) {
        if (name === defProp.name) {
          propConfig = defProp
          break
        }
      }

      if (propConfig === undefined) continue

      const type: string = propConfig.type
      const test: boolean = propConfig.test
      const method: string = propConfig.method
      if (
        !test || method === 'separately'
        || (type === 'boolean' && prop !== true)
        || prop === ''
        || (prop.length !== undefined && prop.length === 0)
      ) continue

      switch (method) {
        case 'prefix': {
          /* cases: string, number */
          let separator = propConfig.separator
          if (separator === undefined) separator = ' '
          const splitDef = definitionReceived.split(separator)
          if (splitDef.length < 2) {
            correct = false
            recGrammar[name] = false
            break
          }

          definitionReceived = splitDef.slice(1).join(separator)
          const prefix = splitDef[0]

          if (!matches(prop.toString(), prefix)) correct = false
          recGrammar[name] = matches(prop.toString(), prefix)
          break
        }
        case 'suffix': {
          /* cases: string, number */
          let separator = propConfig.separator
          if (separator === undefined) separator = ' '
          const splitDef = definitionReceived.split(separator)
          if (splitDef.length < 2) {
            correct = false
            recGrammar[name] = false
            break
          }

          definitionReceived = splitDef.slice(0, -1).join(separator)
          const suffix = splitDef[splitDef.length - 1]

          if (!matches(prop.toString(), suffix)) correct = false
          recGrammar[name] = matches(prop.toString(), suffix)
          break
        }
        case 'inline': {
          /* cases: string, number, boolean, multiple choice */
          const answer = grammarInputs[name]
          if (answer === undefined) {
            correct = false
            recGrammar[name] = false
            break
          }
          switch (type) {
            case 'string': {
              if (!matches(prop, answer)) correct = false
              recGrammar[name] = matches(prop, answer)
              break
            }
            case 'number': {
              if (!matches(prop.toString(), answer)) correct = false
              recGrammar[name] = matches(prop.toString(), answer)
              break
            }
            case 'boolean': {
              /* should already be handled by checking that answer exists */
              recGrammar[name] = true
              break
            }
            case 'Choice': {
              const multiple = propConfig.multiple
              if (multiple !== true) {
                if (!matches(prop, answer)) correct = false
                recGrammar[name] = matches(prop, answer)
                break
              } else {
                const propFmt = prop.join(' ')
                if (!matches(propFmt, answer)) correct = false
                recGrammar[name] = matches(propFmt, answer)
                break
              }
            }
          }
          break
        }
      }
    }
  }

  const definition = card.definition.definition ?? card.definition
  let definitionStr: string
  if (typeof definition === 'string') definitionStr = definition
  else if (typeof definition === 'number') definitionStr = definition.toString()
  else if (Array.isArray(definition)) definitionStr = definition.join(' ')
  else definitionStr = JSON.stringify(definition)
  if (!matches(definitionStr, definitionReceived)) correct = false
  const received = {
    definition: matches(definitionStr, definitionReceived),
    grammar: recGrammar
  }

  startReview(card, received, correct).catch(e => { console.error(e) })
}

const makeQueueRibbon = (card: any, config: any) => {
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
  nextBtn.addEventListener('click', e => { toQueueReview(card, config) })

  ribbon.appendChild(closeBtn)
  ribbon.appendChild(nextBtn)
  return ribbon
}

const makeQueueRevRibbon = () => {
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
  nextBtn.addEventListener('click', e => { restartQueue() })
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

    if (propConfig === undefined) continue

    const type: string = propConfig.type
    const test: boolean = propConfig.test
    const method: string = propConfig.method
    if (test && method === 'inline') {
      if (type !== 'boolean') reqMet = true
      else if (prop !== false) reqMet = true
    }
  }
  return reqMet
}

const prefillHints = (card: any, config: any) => {
  if (card.grammar === undefined) return
  if (card.grammar.properties === undefined) return

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

    if (propConfig === undefined) continue

    const type: string = propConfig.type
    const test: boolean = propConfig.test
    const hint: boolean | undefined = propConfig.hint
    const method: string = propConfig.method
    if (
      test && hint === true
      && method === 'inline'
      && type !== 'boolean'
    ) addProp(name)
  }
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
  document.getElementById('queue-definition')?.focus()

  // Grammar property input fields
  const grammarStatus = includesProperties(card, config)
  if (grammarStatus) {
    const grammarProps = putProps()
    content!.appendChild(grammarProps)
    prefillHints(card, config)
  }

  // Append navigation ribbon
  const ribbon = makeQueueRibbon(card, config)
  content!.appendChild(ribbon)
}

const buildQueueReview = (correct: boolean, card: string, received: string, stats: number[]) => {
  // Build content for review
  let content = document.getElementById('content')
  if (content === null) {
    makeEditorContent()
    content = document.getElementById('content')
  }

  // Progress bar
  const progressBar = document.createElement('div')
  progressBar.id = 'progress-bar'
  content!.appendChild(progressBar)

  // Make review card
  const revCard = newReviewCard(correct, card, received, stats)
  content!.appendChild(revCard)

  // Append navigation ribbon
  const ribbon = makeQueueRevRibbon()
  content!.appendChild(ribbon)
}

window.exports = {
  deconstructQueue,
  refreshQueue,
  setQueueTitle,
  makeQueueContent,
  updateProgressBar,
  buildQueueCard,
  buildQueueReview
}
