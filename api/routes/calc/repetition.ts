// Spaced repetition algorithm
// See docs/repetition.md for more info

// Type definitions
import { type History } from '../elements.js'

// Helper funcs
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
  const DAY = 1000 * 60 * 60 * 24
  const t = (now.getTime() - responses[n - 1][0]) / DAY

  const deltaT: number[] = []
  for (let i = 1; i < n; i++) {
    deltaT.push((responses[i][0] - responses[i - 1][0]) / DAY)
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
  const tests = history.tests
  if (n === 0 || tests[tests.length - 1][1] === false) {
    history.score = 0
    return
  }

  // Current streak of correct responses, calculated only for streak
  let NCorrect = 0
  for (let i = n - 1; i >= 0; i--) {
    /* istanbul ignore next */
    if (tests[i][1] === true) {
      NCorrect += (i === 0 ? 1 : deltaT[i - 1] / (deltaT[i - 1] + K))
    } else {
      break
    }
  }
  const sigma = (NCorrect + 1) / (NCorrect + 2)

  // Learning parameters
  const m = 7 // rate of change of initial retention from learning
  const b = 1 // initial retention after first learning

  // Calculate estimated parameters
  const x1 = m * NCorrect + b // initial retention from learning
  const k = 0.25 // proportionality constant for retention rate multiplier

  // Calculate score
  const mu = k / (1 - sigma) // retention rate multiplier
  const C = mu - Math.log(x1) // constant of integration
  const score = mu / (Math.log(t + x1) + C)
  history.score = Math.round(score * 1000) / 1000 // round to 3 decimal places
}

// Exports
export { score }
