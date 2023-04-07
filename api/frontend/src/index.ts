// Globals
let pwd = '/'

// Make file preview scaffold
setTitle('Files')
makeContent()
buildFiles()

// Define callables
const cd = (dir: string) => {
  // Change directory
  const content = document.getElementById('content')
  if (content === null) return
  pwd += dir + '/'
  showDir(pwd)
}

// Export callables
window.exports = {
  cd
}
