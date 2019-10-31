const debug = require('debug')('tx:action')
const glob = require('glob')
const config = require('../config.js')

const actions = {}

const actionInterface = ['execute', 'name', 'unexecute']
const matchInterface = mod => {
  const match = Object
    .keys(mod)
    .sort()
    .filter((prop, idx) => prop === actionInterface[idx])
  return match.length === actionInterface.length
}

debug(`loading actions from ${config.action.plugin_dir}`)
glob.sync(`${config.action.plugin_dir}/*.js`).forEach(function (filename) {
  const action = require(filename)
  if (!matchInterface(action)) return
  debug(`loaded action ${action.name}`)
  actions[action.name] = action
})

const find = name => actions[name]

module.exports = {
  find
}
