// Globals
let pwd = '/'

// Make file preview scaffold
setTitle('Files')
makeContent()
buildFiles()

// Helper funcs
const traverse = (dir: string) => {
  const paths = dir.split('/')
  paths.splice(paths.length - 2, 2)
  return paths.join('/') + '/'
}
const sanitize = (dirname: string) => dirname.replace(/[^a-z0-9]/gi, '-')

// Define callables
const cd = (dir: string) => {
  // Change directory
  if (dir !== '..') pwd += dir + '/'
  else pwd = traverse(pwd)
  hidePopups()
  showDir(pwd)
}

const mkdir = async (dir: string) => {
  // Make directory
  const dirname = sanitize(dir)
  if (dirname === 'purged') {
    alert('This is a reserved name')
    return
  }
  const loc = pwd + dirname
  const res = await fetch('/api/vfs/folder', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ loc })
  })

  // Error handling
  if (res.status !== 200) {
    const e = await res.text()
    console.error(e)
    alert(e)
  }

  // Refresh view
  hidePopups()
  showDir(pwd)
}

const touch = async (file: string) => {
  // Create document
  const filename = sanitize(file)
  if (filename === 'purged') {
    alert('This is a reserved name')
    return
  }
  const content = {}
  const res = await fetch('/api/vfs/document', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ loc: pwd, name: filename, content })
  })

  // Error handling
  if (res.status !== 200) {
    const e = await res.text()
    console.error(e)
    alert(e)
  }

  // Refresh view
  hidePopups()
  showDir(pwd)
}

const rm = async (name: string) => {
  // Delete resource
  let loc = pwd + name
  if (name === '..') loc = pwd
  const res = await fetch(
    '/api/vfs/resource?'
    + new URLSearchParams({ loc }).toString(),
    { method: 'DELETE' }
  )

  // Error handling
  if (res.status !== 200) {
    const e = await res.text()
    console.error(e)
    alert(e)
  }

  // Refresh view
  if (name === '..') cd(name)
  else showDir(pwd)
}

// Export callables
window.exports = {
  cd,
  mkdir,
  touch,
  rm
}
