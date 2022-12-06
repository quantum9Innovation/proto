type email = `${string}@${string}.${string}`
type orderedList = Array<[string, number]>
type Test = [number, boolean]

interface Choice {
  choices: string[]
  multiple?: boolean
}

export { email, orderedList, Choice, Test }
