const { resolve } = require('path')

// https://jestjs.io/docs/en/configuration.html
module.exports = {
  testEnvironment: 'node',
  roots: ['src'],
  modulePathIgnorePatterns: ['helpers.js'],
  coverageDirectory: resolve(__dirname, 'coverage'),
  coverageReporters: ['text', 'html'],
  bail: true
}
