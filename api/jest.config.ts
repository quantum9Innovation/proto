import type { Config } from 'jest'

const jestConfig: Config = {
  modulePaths: ['./compiled/'],
  testMatch: ['**/compiled/tests/*.js'],
  setupFilesAfterEnv: ['./compiled/tests/setup.js'],
  transform: {}
}

export default jestConfig
