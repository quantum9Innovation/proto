// Test all endpoints in vfs/

// Type definitions
import { StdRes, JSONRes, FileStructure } from './res'

// Imports
import { endpoint } from './setup'
import { app } from '../index'
import { expect } from '@jest/globals'

// Tests
// Check all basic functions
describe('/vfs (base)', () => {
  // Create root
  describe('Setup', () => {
    test('POST /vfs/document', endpoint(app, '/vfs/document', (res: StdRes) => {
      expect(res.body.message).toBe('Document uploaded successfully.')
    }, {
      method: 'post',
      request: {
        loc: '/',
        name: 'doc1',
        content: { content: 'This is the first document.' }
      }
    }))

    test('POST /vfs/folder', endpoint(app, '/vfs/folder', (res: StdRes) => {
      expect(res.body.message).toBe('Folder created successfully.')
    }, {
      method: 'post',
      request: { loc: '/folder1' }
    }))
  })

  // Create elements in folder
  describe('Subpaths', () => {
    test('POST /vfs/document', endpoint(app, '/vfs/document', (res: StdRes) => {
      expect(res.body.message).toBe('Document uploaded successfully.')
    }, {
      method: 'post',
      request: {
        loc: '/folder1',
        name: 'doc2',
        content: { content: 'This is the second document.' }
      }
    }))

    test('POST /vfs/folder', endpoint(app, '/vfs/folder', (res: StdRes) => {
      expect(res.body.message).toBe('Folder created successfully.')
    }, {
      method: 'post',
      request: { loc: '/folder1/folder2' }
    }))
  })

  // Rewrite document in folder
  describe('POST /vfs/document', () => {
    test('folder1 (replace)', endpoint(app, '/vfs/document', (res: StdRes) => {
      expect(res.body.message).toBe('Document uploaded successfully.')
    }, {
      method: 'post',
      request: {
        loc: '/folder1',
        name: 'doc2',
        content: { content: 'This document has been replaced.' }
      }
    }))
  })

  // Test file structure
  describe('File structure', () => {
    test('GET /vfs', endpoint(app, '/vfs', (res: JSONRes) => {
      const data: FileStructure = JSON.parse(res.text)
      expect(data.folders).toStrictEqual(['folder1'])
      expect(data.documents).toStrictEqual(['doc1.json'])
    }))

    test('GET /vfs/serve (folder1)', endpoint(app, '/vfs/serve', (res: JSONRes) => {
      const data: FileStructure = JSON.parse(res.text)
      expect(data.folders).toStrictEqual(['folder2'])
      expect(data.documents).toStrictEqual(['doc2.json'])
    }, { request: { path: '/folder1' } }))

    test('GET /vfs/serve (doc2-exists)', endpoint(app, '/vfs/serve', (res: JSONRes) => {
      const data = JSON.parse(res.text)
      expect(data.content).toBe('This document has been replaced.')
    }, {
      contentType: 'application/json; charset=UTF-8',
      request: { path: '/folder1/doc2.json' }
    }))
  })

  // Delete file
  describe('DELETE /vfs/resource', () => {
    test('*', endpoint(app, '/vfs/resource', (res: StdRes) => {
      expect(res.body.message).toBe('Resource moved to trash.')
    }, {
      method: 'delete',
      request: { loc: '/folder1/doc2.json' }
    }))
  })

  // Get deleted file
  describe('GET /vfs/serve', () => {
    test('*', endpoint(app, '/vfs/serve', (res: JSONRes) => {
      expect(res.text).toBe('Resource not found.')
    }, {
      contentType: 'text/html; charset=utf-8',
      status: 404,
      request: { path: '/folder1/doc2.json' }
    }))
  })
})

// Check all folder edge cases
describe('POST /vfs/folder', () => {
  // Post to protected location
  test('purged', endpoint(app, '/vfs/folder', (res: JSONRes) => {
    expect(res.text).toBe('Modifying trash directory disallowed.')
  }, {
    contentType: 'text/html; charset=utf-8',
    status: 403,
    method: 'post',
    request: { loc: '/purged/folder' }
  }))

  // Create duplicate folder
  test('duplicate', endpoint(app, '/vfs/folder', (res: JSONRes) => {
    expect(res.text).toBe('Location already exists.')
  }, {
    contentType: 'text/html; charset=utf-8',
    status: 400,
    method: 'post',
    request: { loc: '/folder1' }
  }))
})

// Check all document edge cases
describe('POST /vfs/document', () => {
  // Post to protected location
  test('purged', endpoint(app, '/vfs/document', (res: JSONRes) => {
    expect(res.text).toBe('Modifying trash directory disallowed.')
  }, {
    contentType: 'text/html; charset=utf-8',
    status: 403,
    method: 'post',
    request: {
      loc: '/purged',
      name: 'doc',
      content: {}
    }
  }))

  // Post to nonexistent location
  test('nonexistent', endpoint(app, '/vfs/document', (res: JSONRes) => {
    expect(res.text).toBe('Location does not exist.')
  }, {
    contentType: 'text/html; charset=utf-8',
    status: 404,
    method: 'post',
    request: {
      loc: '/folder',
      name: 'doc',
      content: {}
    }
  }))

  // Post into another document
  test('not a folder', endpoint(app, '/vfs/document', (res: JSONRes) => {
    expect(res.text).toBe('Location is not a valid directory.')
  }, {
    contentType: 'text/html; charset=utf-8',
    status: 400,
    method: 'post',
    request: {
      loc: '/doc1.json',
      name: 'doc',
      content: {}
    }
  }))
})

// Check all delete edge cases
describe('DELETE /vfs/resource', () => {
  // Delete from protected location
  test('purged', endpoint(app, '/vfs/resource', (res: JSONRes) => {
    expect(res.text).toBe(
      'Cannot delete from trash with client-side request; '
      + 'this action must be taken from the server.'
    )
  }, {
    contentType: 'text/html; charset=utf-8',
    status: 403,
    method: 'delete',
    request: { loc: '/purged' }
  }))

  // Delete nonexistent resource
  test('nonexistent', endpoint(app, '/vfs/resource', (res: JSONRes) => {
    expect(res.text).toBe('Location does not exist; no deletion performed.')
  }, {
    contentType: 'text/html; charset=utf-8',
    method: 'delete',
    request: { loc: '/imaginary' }
  }))

  // Create duplicate filename and delete it
  describe('Duplicate', () => {
    // Create a duplicate filename
    test('POST /vfs/document', endpoint(app, '/vfs/document', (res: StdRes) => {
      expect(res.body.message).toBe('Document uploaded successfully.')
    }, {
      method: 'post',
      request: {
        loc: '/',
        name: 'folder1-doc2',
        content: {}
      }
    }))

    // Delete duplicate file
    test('DELETE /vfs/resource', endpoint(app, '/vfs/resource', (res: StdRes) => {
      expect(res.body.message).toBe('Resource moved to trash.')
    }, {
      method: 'delete',
      request: { loc: '/folder1-doc2.json' }
    }))
  })
})

export {}
