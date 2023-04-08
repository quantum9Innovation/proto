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
    cardInfo.addEventListener('click', e => { /* TODO: info/edit logic */ })
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
