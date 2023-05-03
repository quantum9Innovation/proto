// Startup routine
const keyBuffer: string[] = []
const KONAMI = 'ArrowUp,ArrowUp,ArrowDown,ArrowDown,ArrowLeft,ArrowRight,ArrowLeft,ArrowRight,b,a'
loadTheme()
const bind = (e: KeyboardEvent, func: () => void) => {
  e.preventDefault()
  func()
}
document.addEventListener('keydown', e => {
  /* toggle theme on ctrl+\ */
  if (e.key === '\\' && e.ctrlKey) bind(e, toggleTheme)
  /* logout on ctrl+q */
  if (e.key === 'q' && e.ctrlKey) bind(e, forgetPIN)
  /* alert ping on alt+p */
  if (e.key === 'p' && e.altKey) bind(e, alertPing)

  else keyBuffer.push(e.key)
  if (keyBuffer.length > 10) keyBuffer.shift()
  if (keyBuffer.join(',') === KONAMI) konami()
})
register().catch(e => { console.error(e) })
vfs()
