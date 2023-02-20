// Spaced repetition algorithm
// See docs/repetition.md for more info

// Type definitions
import { type History } from '../elements'

// Helper funcs
const Sigma = (lower: number, upper: number, expr: (i: number) => number) => {
  let sum = 0
  for (let i = lower; i <= upper; i++) sum += expr(i)
  return sum
}
const processResponses = (history: History) => {
  /*
    Process past responses and return:
    t => time since last response
    n => number of total responses
    deltaT (list) => for each response*, the time since it was last studied
    *except the first response, for which there is no comparison
  */
  const responses = history.tests
  const n = responses.length

  // If no responses, return empty lists
  /* istanbul ignore next */
  if (n === 0) return { t: 0, n, deltaT: [] }

  const now = new Date()
  const t = now.getTime() - responses[n - 1][0]

  const deltaT: number[] = []
  for (let i = 1; i < n; i++) {
    deltaT.push(responses[i][0] - responses[i - 1][0])
  }

  return { t, n, deltaT }
}

// Define exports
const score = (history: History) => {
  // Get required constants
  const { t, n, deltaT } = processResponses(history)
  const K = 1 / 8 // learning productivity time decay constant

  // Check if enough data exists for score calculation
  /* istanbul ignore next */
  if (n === 0) {
    history.score = 0
    return
  }

  // Current streak of correct responses, calculated like `NTotal` but only for streak
  let NCorrect = 0
  for (let i = n - 1; i >= 0; i--) {
    if (history.tests[i][1]) {
      i === 0 ? NCorrect += 1 : NCorrect += deltaT[i - 1] / (deltaT[i - 1] + K)
    } else break
  }
  const sigma = (NCorrect + 1) / (NCorrect + 2)

  // Weighted total tests
  const NTotal = Sigma(0, n - 1, i => i === 0 ? 1 : deltaT[i - 1] / (deltaT[i - 1] + K))

  // Learning parameters
  const m = 3 // rate of change of initial retention from learning
  const b = 1 // initial retention after first learning

  // Calculate estimated parameters
  const x1 = m * NTotal + b // initial retention from learning
  const k = 0.25 // proportionality constant for retention rate multiplier

  // Calculate score
  const mu = k / (1 - sigma) // retention rate multiplier
  const C = mu - Math.log(x1) // constant of integration
  history.score = mu / (Math.log(t) + C)
}

// Exports
export { score }
