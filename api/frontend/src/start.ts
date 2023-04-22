// Startup routine
loadTheme()
document.addEventListener('keyup', e => {
  /* toggle theme on backslash */
  if (e.key === '\\') toggleTheme()
})
register().catch(e => { console.error(e) })
vfs()
