export interface StdRes extends Express.Response {
  body: {
    message: string
  }
}

export interface JSONRes extends Express.Response {
  text: string
}

export interface FileStructure {
  documents: string[]
  folders: string[]
}
