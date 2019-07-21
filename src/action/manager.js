const debug = require('debug')('tx:action');
const glob = require('glob');
const path = require('path');
const config = require('../config.js');

const actions = {};

const action_interface = ['execute', 'name', 'unexecute'];
const match_interface = mod => {
  const match = Object
    .keys(mod)
    .sort()
    .filter((prop, idx) => prop == action_interface[idx]);
  return match.length == action_interface.length;
}

debug(`loading actions from ${config.action.plugin_dir}`)
glob.sync(`${config.action.plugin_dir}/*.js`).forEach(function (filename) {
  const action = require(filename);
  if (!match_interface(action)) return;
  debug(`loaded action ${action.name}`)
  actions[action.name] = action;
});

const find = name => actions[name];

module.exports = {
  find,
};
