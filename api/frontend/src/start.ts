// Startup routine
const keyBuffer: string[] = []
const KONAMI = 'ArrowUp,ArrowUp,ArrowDown,ArrowDown,ArrowLeft,ArrowRight,ArrowLeft,ArrowRight,b,a'
loadTheme()
document.addEventListener('keydown', e => {
  /* toggle theme on ctrl+\ */
  if (e.key === '\\' && e.ctrlKey) toggleTheme()
  /* alert ping on alt+p */
  if (e.key === 'p' && e.altKey) alertPing()
  else keyBuffer.push(e.key)
  if (keyBuffer.length > 10) keyBuffer.shift()
  if (keyBuffer.join(',') === KONAMI) konami()
})
register().catch(e => { console.error(e) })
vfs()
